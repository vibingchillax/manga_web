import { randomUUID } from 'crypto'
import { z } from 'zod'

const beginSchema = z.object({
  groups: z.array(z.string().uuid({ message: "Group ID must be a valid UUID" }))
    .refine((arr) => new Set(arr).size === arr.length, {
      message: "Duplicate group IDs are not allowed"
    })
  ,
  manga: z.string().uuid({ message: "Manga ID must be a valid UUID" })
})

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: "Not authenticated"
  })

  const body = beginSchema.safeParse(await readBody(event))

  if (!body.success) throw createError({
    statusCode: 400,
    statusMessage: "Invalid request data",
    data: body.error.flatten()
  })

  const data = body.data

  const session = await prisma.uploadSession.create({
    data: {
      id: randomUUID(),
      mangaId: data.manga,
      userId: user.id,
      groups: {
        create: data.groups.map((gid) => ({
          group: {
            connect: { id: gid }
          }
        }))
      }
    }
  })

  return {
    id: session.id,
    type: "upload_session",
    attributes: {
      isCommited: session.isCommitted,
      isProcessed: session.isProcessed,
      isDeleted: session.isDeleted,
      version: session.version,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }
  }
})