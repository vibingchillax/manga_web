import { z } from "zod";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not logged in",
    });

  await prisma.mangaFollow.delete({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: params.id,
      },
    },
  });

  return {
    status: "ok",
  };
});
