import { z } from "zod"
import { UserRole } from "~~/shared/prisma/enums"
import { PrismaClientKnownRequestError } from "~~/shared/prisma/internal/prismaNamespace"

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: "Not authenticated"
  })

  if (!user.roles.includes(UserRole.admin)) throw createError({
    statusCode: 403,
    statusMessage: "Forbidden"
  })

  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
  }).parse)

  const body = await readValidatedBody(event, z.object({
    volume: zVolume.optional(),
    description: z.string().optional(),
    locale: zLang
  }).parse)

  try {
    const updated = await prisma.coverArt.update({
      where: {
        id: params.id
      },
      data: {
        ...body,
        version: {
          increment: 1
        }
      }
    })

    return {
      result: 'ok',
      data: formatCoverArt(updated)
    }
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Cover not found',
      })
    }
    throw err
  }
})