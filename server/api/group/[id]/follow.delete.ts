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

  try {
    await prisma.groupFollow.delete({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: params.id,
        },
      },
    });
  } catch {}

  return {
    result: "ok",
  };
});
