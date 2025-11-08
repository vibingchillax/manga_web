import { z } from "zod";
import { CommentTargetType } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      "chapter[]": zArrayable(zUuid),
    }).parse,
  );

  const chapterIds = query["chapter[]"] as string[];

  const chapters = await prisma.uploadedChapter.findMany({
    where: { id: { in: chapterIds } },
    select: { id: true, viewCount: true },
  });

  if (!chapters.length)
    return {
      result: "ok",
      statistics: {},
    };

  const commentCounts = await prisma.commentTarget.groupBy({
    by: ["targetId"],
    where: {
      targetType: CommentTargetType.chapter,
      targetId: { in: chapterIds },
    },
    _count: { commentId: true },
  });

  const commentMap = Object.fromEntries(
    commentCounts.map((c) => [c.targetId, c._count.commentId]),
  );

  const statistics: { [key: string]: { views: number; comments: number } } = {};

  for (const chapter of chapters) {
    statistics[chapter.id] = {
      views: chapter.viewCount,
      comments: commentMap[chapter.id] ?? 0,
    };
  }

  return {
    result: "ok",
    statistics,
  };
});
