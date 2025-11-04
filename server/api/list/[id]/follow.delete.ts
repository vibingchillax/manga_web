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
    await prisma.listFollow.delete({
      where: {
        userId_listId: {
          userId: user.id,
          listId: params.id,
        },
      },
    });
  } catch {}

  return {
    result: "ok",
  };
});
