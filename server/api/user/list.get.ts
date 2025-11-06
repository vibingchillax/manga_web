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
      take: query.limit,
      skip: query.offset,
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
    limit: query.limit,
    offset: query.offset,
    count: total,
  };
});
