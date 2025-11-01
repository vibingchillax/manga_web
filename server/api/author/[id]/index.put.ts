import { z } from 'zod'
import { formatAuthor } from '~~/server/utils/formatResponse'
import { PrismaClientKnownRequestError } from '~~/shared/prisma/internal/prismaNamespace'
import { AuthorDataSchema } from '../index.post'
import { UserRole } from '~~/shared/prisma/enums'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  if (!user.roles.includes(UserRole.admin)) throw createError({
    statusCode: 403,
    statusMessage: "Forbidden"
  })

  const params = await getValidatedRouterParams(event, z.object({ id: zUuid }).parse)
  const body = await readValidatedBody(event, AuthorDataSchema.parse)

  try {
    const author = await prisma.author.update({
      where: {
        id: params.id
      },
      data: body
    })

    return {
      result: 'ok',
      data: formatAuthor(author)
    }
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Author not found',
      })
    }
    throw err
  }
})