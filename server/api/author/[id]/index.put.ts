import * as z from 'zod'
import { formatAuthor } from '~~/server/utils/formatResponse'
import { PrismaClientKnownRequestError } from '~~/shared/prisma/internal/prismaNamespace'
import { AuthorDataSchema } from '../index.post'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({ id: z.string().uuid() }).parse)
  const body = await readValidatedBody(event, AuthorDataSchema.safeParse)

  if (!body.success) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request data',
    data: body.error.flatten()
  })

  const data = body.data

  try {
    const author = await prisma.author.update({
      where: {
        id: params.id
      },
      data: {
        name: data.name,
        biography: data.biography,
        twitter: data.twitter,
        pixiv: data.pixiv,
        melonBook: data.melonBook,
        fanBox: data.fanBox,
        booth: data.booth,
        nicoVideo: data.nicoVideo,
        skeb: data.skeb,
        fantia: data.fantia,
        tumblr: data.tumblr,
        youtube: data.youtube,
        weibo: data.weibo,
        naver: data.naver,
        website: data.website
      }
    })

    return formatAuthor(author)
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