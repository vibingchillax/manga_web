import { MangaFollowStatus } from "~~/shared/prisma/enums"
import * as z from 'zod'

const schema = z.object({
  status: z.nativeEnum(MangaFollowStatus)
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const mangaId = getRouterParam(event, 'id')

  if (!mangaId) throw createError({
    statusCode: 400,
    statusMessage: 'No manga id'
  })

  const body = schema.safeParse(await readBody(event))

  if (!body.success) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request data',
    data: body.error.flatten()
  })

  const status = body.data.status

  await prisma.mangaFollows.upsert({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId: mangaId
      }
    },
    update: {
      status: status ?? 'reading'
    },
    create: {
      userId: user.id,
      mangaId,
      status: status ?? 'reading'
    }
  })

  return {
    status: 'ok'
  }
})