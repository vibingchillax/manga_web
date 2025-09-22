export default defineEventHandler(async (event) => {
  const mangaId = getRouterParam(event, 'id')
  const user = await getAuthenticatedUser(event)

  if (!mangaId) throw createError({
    statusCode: 400,
    statusMessage: 'No manga id'
  })
  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const result = await prisma.mangaFollows.findUnique({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: mangaId
      }
    }
  })

  return {
    status: result?.status ?? 'none'
  }

})