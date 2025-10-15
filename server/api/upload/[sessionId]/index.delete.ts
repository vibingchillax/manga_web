import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    sessionId: z.string().uuid()
  }).parse)

  const session = await prisma.uploadSession.delete({
    where: {
      id: params.sessionId,
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