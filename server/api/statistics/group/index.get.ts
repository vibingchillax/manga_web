import { z } from "zod";
import { CommentTargetType } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      "group[]": zArrayable(zUuid),
    }).parse,
  );

  const groupIds = query["group[]"] as string[];

  if (!groupIds.length) {
    return {
      result: "ok",
      statistics: {},
    };
  }

  const commentCounts = await prisma.commentTarget.groupBy({
    by: ["targetId"],
    where: {
      targetType: CommentTargetType.group,
      targetId: { in: groupIds },
    },
    _count: { commentId: true },
  });

  const commentMap = Object.fromEntries(
    commentCounts.map((c) => [c.targetId, c._count.commentId]),
  );

  const statistics: { [key: string]: { comments: number } } = {};

  for (const groupId of groupIds) {
    statistics[groupId] = {
      comments: commentMap[groupId] ?? 0,
    };
  }

  return {
    result: "ok",
    statistics,
  };
});
