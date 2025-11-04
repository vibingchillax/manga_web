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

  const groupFollows = await prisma.groupFollow.findMany({
    take: query.limit ?? 10,
    skip: query.offset ?? 0,
    where: {
      userId: user.id,
    },
    select: {
      group: true,
    },
  });

  return {
    result: "ok",
    data: groupFollows.map((g) => formatGroup(g.group)),
  };
});
