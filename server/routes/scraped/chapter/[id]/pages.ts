import * as z from 'zod'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  try {
    const pages = await prisma.scrapedPage.findFirst({
      where: {
        chapterId: params.id
      }
    })

    if (pages?.data && pages.data.length > 0) return pages;

    const chapter = await prisma.scrapedChapter.findUnique({
      where: {
        id: params.id
      }
    })

    if (!chapter) throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found'
    })

    const result = await sourcesInstance.runSourceForPages({
      chapter: {
        id: chapter.id,
        sourceId: chapter.sourceId,
        url: chapter.url
      }
    })

    if (result.length === 0) throw createError({
      statusCode: 404,
      statusMessage: 'Pages not found'
    })

    const created = await prisma.scrapedPage.create({
      data: {
        id: randomUUID(),
        chapterId: chapter.id,
        data: result.map(page => page.url)
      }
    })

    return created
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error)
    })
  }
})