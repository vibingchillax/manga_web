import { z } from "zod";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const query = await getValidatedQuery(
    event,
    paginationSchema.extend({
      "order[score]": zOrderDirection.default("desc"),
      "order[createdAt]": zOrderDirection.optional(),
    }).parse,
  );

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      take: query.limit,
      skip: query.offset,
      where: {
        parentId: params.id,
      },
      orderBy: {
        createdAt: query["order[createdAt]"] ?? "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            roles: true,
          },
        },
        votes: {
          select: {
            vote: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    }),

    prisma.comment.count({
      where: {
        parentId: params.id,
      },
    }),
  ]);

  let sorted = comments;

  const direction = query["order[score]"] === "asc" ? 1 : -1;
  sorted = [...comments].sort((a, b) => {
    const scoreA = a.votes.reduce((s, v) => s + v.vote, 0);
    const scoreB = b.votes.reduce((s, v) => s + v.vote, 0);
    return (scoreA - scoreB) * direction;
  });

  return {
    result: "ok",
    data: sorted.map(formatComment),
    limit: query.limit,
    offset: query.offset,
    total: total,
  };
});
