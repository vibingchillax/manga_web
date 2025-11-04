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

  const body = await readValidatedBody(
    event,
    z.object({
      rating: z.number().min(0).max(10),
    }).parse,
  );

  await prisma.mangaRating.upsert({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: params.mangaId,
      },
    },
    update: {
      rating: body.rating,
    },
    create: {
      userId: user.id,
      mangaId: params.mangaId,
      rating: body.rating,
    },
  });

  return {
    result: "ok",
  };
});
