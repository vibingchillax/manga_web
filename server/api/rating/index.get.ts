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
    z.object({
      manga: zArrayable(zUuid).optional(),
    }).parse,
  );

  const mangaList = (query.manga as string[]) || undefined;

  const ratings = await prisma.mangaRating.findMany({
    where: {
      userId: user.id,
      mangaId: { in: mangaList },
    },
  });

  return {
    result: "ok",
    ratings: Object.fromEntries(
      ratings.map(({ mangaId, ...rest }) => [
        mangaId,
        {
          rating: rest.rating,
          updatedAt: rest.updatedAt,
        },
      ]),
    ),
  };
});
