import { z } from "zod";
import { CommentTargetType } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      "manga[]": zArrayable(zUuid),
    }).parse,
  );

  const mangaIds = query["manga[]"] as string[];

  if (!mangaIds.length) {
    return {
      result: "ok",
      statistics: {},
    };
  }

  const mangas = await prisma.manga.findMany({
    where: { id: { in: mangaIds } },
    select: { id: true, viewCount: true },
  });

  if (!mangas.length) {
    return {
      result: "ok",
      statistics: {},
    };
  }

  const commentCounts = await prisma.commentTarget.groupBy({
    by: ["targetId"],
    where: {
      targetType: CommentTargetType.manga,
      targetId: { in: mangaIds },
    },
    _count: { commentId: true },
  });

  const commentMap = Object.fromEntries(
    commentCounts.map((c) => [c.targetId, c._count.commentId]),
  );

  const ratingAgg = await prisma.mangaRating.groupBy({
    by: ["mangaId"],
    where: { mangaId: { in: mangaIds } },
    _avg: { rating: true },
    _count: { rating: true },
    _sum: { rating: true },
  });

  const ratingMap = Object.fromEntries(
    ratingAgg.map((r) => {
      const R = r._avg.rating ?? 0;
      const v = r._count.rating;
      const sum = r._sum.rating ?? 0;
      return [r.mangaId, { R, v, sum }];
    }),
  );

  const globalRatingAgg = await prisma.mangaRating.aggregate({
    _avg: { rating: true },
  });

  const C = globalRatingAgg._avg.rating ?? 0;
  const m = 5; // minimum votes for Bayesian smoothing

  const followAgg = await prisma.mangaFollow.groupBy({
    by: ["mangaId"],
    where: { mangaId: { in: mangaIds } },
    _count: { mangaId: true },
  });

  const followMap = Object.fromEntries(
    followAgg.map((f) => [f.mangaId, f._count.mangaId]),
  );

  const statistics: {
    [key: string]: {
      views: number;
      comments: number;
      rating: { average: number; bayesian: number; votes: number };
      follows: number;
    };
  } = {};

  for (const manga of mangas) {
    const comments = commentMap[manga.id] ?? 0;

    const rating = ratingMap[manga.id];
    const R = rating?.R ?? 0;
    const v = rating?.v ?? 0;

    const bayesian = v === 0 ? 0 : (v / (v + m)) * R + (m / (v + m)) * C;

    const follows = followMap[manga.id] ?? 0;

    statistics[manga.id] = {
      views: manga.viewCount,
      comments,
      rating: {
        average: R,
        bayesian,
        votes: v,
      },
      follows,
    };
  }

  return {
    result: "ok",
    statistics,
  };
});
