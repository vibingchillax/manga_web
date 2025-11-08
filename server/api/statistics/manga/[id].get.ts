import { z } from "zod";
import { CommentTargetType } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({ id: zUuid }).parse,
  );

  const [manga, commentsCount, ratingAgg, globalRatingAgg, followCount] =
    await Promise.all([
      prisma.manga.findUnique({
        where: { id: params.id },
        select: { viewCount: true },
      }),

      prisma.comment.count({
        where: {
          parentId: null,
          target: {
            targetType: CommentTargetType.manga,
            targetId: params.id,
          },
        },
      }),

      prisma.mangaRating.aggregate({
        where: { mangaId: params.id },
        _avg: { rating: true },
        _count: { rating: true },
        _sum: { rating: true },
      }),

      prisma.mangaRating.aggregate({
        _avg: { rating: true },
      }),

      prisma.mangaFollow.count({
        where: { mangaId: params.id },
      }),
    ]);

  if (!manga) {
    throw createError({
      statusCode: 404,
      statusMessage: "Manga not found",
    });
  }

  const R = ratingAgg._avg.rating ?? 0;
  const v = ratingAgg._count.rating;
  const C = globalRatingAgg._avg.rating ?? 0;
  const m = 5; // minimum votes for Bayesian adjustment

  const bayesian = v === 0 ? 0 : (v / (v + m)) * R + (m / (v + m)) * C;

  return {
    result: "ok",
    statistics: {
      [params.id]: {
        views: manga.viewCount,
        comments: commentsCount,
        rating: {
          average: R,
          bayesian,
          votes: v,
        },
        follows: followCount,
      },
    },
  };
});
