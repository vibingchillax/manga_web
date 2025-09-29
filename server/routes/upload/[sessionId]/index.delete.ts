export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const id = getRouterParam(event, 'sessionId')

  if (!id) throw createError({
    statusCode: 400,
    statusMessage: 'No sessionId provided'
  })

  const session = await prisma.uploadSession.delete({
    where: {
      id: id,
      userId: user.id
    }
  })

  try {
    await kubo.files.rm(`/manga_web/${session.mangaId}/${session.id}`, { recursive: true })
  } catch (e) {
    console.warn("Failed to delete files from IPFS", e)
  }

  return {
    result: "ok"
  }
})