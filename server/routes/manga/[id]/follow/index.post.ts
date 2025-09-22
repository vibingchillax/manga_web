import { MangaFollowStatus } from "~~/shared/prisma/enums"

export default defineEventHandler(async (event) => {
  const mangaId = getRouterParam(event, 'id')
  const body: {status: MangaFollowStatus} = await readBody(event)
  const user = await getAuthenticatedUser(event)

  if (!mangaId) throw createError({
    statusCode: 400,
    statusMessage: 'No manga id'
  })
  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  await prisma.mangaFollows.upsert({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: mangaId
      }
    },
    update: {
      status: body.status ?? 'reading'
    },
    create: {
      userId: user.id,
      mangaId,
      status: body.status ?? 'reading'
    }
  })

  return {
    status: 'ok'
  }
})