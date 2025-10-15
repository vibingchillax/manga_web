import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const result = await prisma.mangaFollows.findUnique({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: params.id
      }
    }
  })

  return {
    status: result?.status ?? 'none'
  }

})