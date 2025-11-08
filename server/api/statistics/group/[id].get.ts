import { z } from "zod";
import { CommentTargetType } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const group = await prisma.scanlationGroup.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
    },
  });

  if (!group)
    throw createError({
      statusCode: 404,
      statusMessage: "Group not found",
    });

  const commentsCount = await prisma.comment.count({
    where: {
      parentId: null,
      target: {
        targetType: CommentTargetType.group,
        targetId: params.id,
      },
    },
  });

  return {
    result: "ok",
    statistics: {
      [params.id]: {
        comments: commentsCount,
      },
    },
  };
});
