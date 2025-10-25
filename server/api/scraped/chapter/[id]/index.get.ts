import * as z from 'zod'
import { formatScrapedChapter } from '~~/server/utils/formatResponse'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const query = await getValidatedQuery(event, z.object({
    'includes[]': z.union([z.string(), z.array(z.string())]).optional().transform(val => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    })
  }).safeParse)

  const chapter = await prisma.scrapedChapter.findUnique({
    where: {
      id: params.id
    },
    include: {
      manga: query.data?.['includes[]']?.includes("manga")
    }
  })

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found'
    })
  }

  return formatScrapedChapter(chapter);
})