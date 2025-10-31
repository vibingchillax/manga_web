import { z } from 'zod'
import { formatScrapedChapter } from '~~/server/utils/formatResponse'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
  }).parse)

  const query = await getValidatedQuery(event, z.object({
    'includes[]': zArrayable(z.string()).optional()
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