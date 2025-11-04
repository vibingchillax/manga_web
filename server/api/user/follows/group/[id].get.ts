import { z } from "zod";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const groupFollow = await prisma.groupFollow.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: params.id,
      },
    },
  });

  if (!groupFollow)
    return {
      result: "nah",
    };

  return {
    result: "ok",
  };
});
