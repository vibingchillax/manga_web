export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not logged in",
    });

  const follows = await prisma.mangaFollow.findMany({
    where: {
      userId: user.id,
    },
  });

  return follows.map((s) => ({
    mangaId: s.mangaId,
    status: s.status,
  }));
});
