import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)
  
  try {
    const manga = await prisma.scrapedManga.findUnique({
      where: {
        id: params.id
      }
    })

    if (!manga) throw createError({
      statusCode: 404,
      statusMessage: 'Manga not found'
    })

    const result = await prisma.scrapedChapter.findMany({
      where: {
        mangaId: params.id
      }
    })

    if (!(result.length > 0)) {
      return await refreshChapters(manga)
    }

    const lastUpdated = result[0].updatedAt
    const stale = Date.now() - lastUpdated.getTime() > 1000 * 60 * 60

    if (stale) {
      refreshChapters(manga).catch((err: any)=> {
        console.error(`Background refresh failed for manga ${params.id}`, err)
      })
    }

    return result

  } catch (error: any) {
    if (error?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error)
    })
  }
})