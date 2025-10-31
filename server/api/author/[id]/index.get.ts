import { z } from 'zod'
import { formatAuthor } from '~~/server/utils/formatResponse'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({ id: zUuid }).parse)

  const query = await getValidatedQuery(event, z.object({
    'includes[]': zArrayable(z.string()).optional()
  }).safeParse)

  const author = await prisma.author.findUnique({
    where: {
      id: params.id
    },
    // include: {
    //   manga: true
    // }
  })

  if (!author) throw createError({
    statusCode: 404,
    statusMessage: 'Author not found'
  })

  return formatAuthor(author)
})