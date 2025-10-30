import * as z from 'zod'
import { formatAuthor } from '~~/server/utils/formatResponse'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({ id: z.string().uuid() }).parse)

  const query = await getValidatedQuery(event, z.object({
    'includes[]': z.union([z.string(), z.array(z.string())]).optional().transform(val => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    })
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