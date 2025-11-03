import { paginationSchema } from "~~/shared/utils/zodHelper";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const query = await getValidatedQuery(event, paginationSchema.parse);

  const [lists, total] = await Promise.all([
    prisma.customList.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: {
        userId: user.id,
      },
    }),

    prisma.customList.count({
      where: {
        userId: user.id,
      },
    }),
  ]);

  return {
    result: "ok",
    data: lists.map(formatCustomList),
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total,
  };
});
