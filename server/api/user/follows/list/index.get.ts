import { z } from "zod";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const query = await getValidatedQuery(
    event,
    paginationSchema.extend({
      "includes[]": zArrayable(z.string()).optional(), //?
    }).parse,
  );

  const listFollows = await prisma.listFollow.findMany({
    take: query.limit,
    skip: query.offset,
    where: {
      userId: user.id,
    },
    select: {
      list: true,
    },
  });

  return {
    result: "ok",
    data: listFollows.map((g) => formatCustomList(g.list)),
  };
});
