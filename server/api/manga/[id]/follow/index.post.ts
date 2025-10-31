import { MangaFollowStatus } from "~~/shared/prisma/enums"
import { z } from 'zod'

const schema = z.object({
  status: z.nativeEnum(MangaFollowStatus)
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
  }).parse)

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
        mangaId: params.id
      }
    },
    update: {
      status: status ?? 'reading'
    },
    create: {
      userId: user.id,
      mangaId: params.id,
      status: status ?? 'reading'
    }
  })

  return {
    status: 'ok'
  }
})