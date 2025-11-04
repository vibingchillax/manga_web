import { z } from "zod";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      mangaId: zUuid,
    }).parse,
  );

  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  try {
    await prisma.mangaRating.delete({
      where: {
        userId_mangaId: {
          userId: user.id,
          mangaId: params.mangaId,
        },
      },
    });
  } catch {}

  return {
    result: "ok",
  };
});
