import { z } from "zod";
import { CommentTargetType } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const [chapter, commentsCount] = await Promise.all([
    prisma.uploadedChapter.findUnique({
      where: {
        id: params.id,
      },
      select: {
        viewCount: true,
      },
    }),

    prisma.comment.count({
      where: {
        parentId: null,
        target: {
          targetType: CommentTargetType.chapter,
          targetId: params.id,
        },
      },
    }),
  ]);

  if (!chapter)
    throw createError({
      statusCode: 404,
      statusMessage: "Chapter not found",
    });

  return {
    result: "ok",
    statistics: {
      [params.id]: {
        views: chapter.viewCount,
        comments: commentsCount,
      },
    },
  };
});
