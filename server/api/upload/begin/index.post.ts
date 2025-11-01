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

  const body = await readValidatedBody(event, beginSchema.parse)

  const session = await prisma.uploadSession.create({
    data: {
      id: randomUUID(),
      mangaId: body.manga,
      userId: user.id,
      groups: {
        create: body.groups.map((gid) => ({
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