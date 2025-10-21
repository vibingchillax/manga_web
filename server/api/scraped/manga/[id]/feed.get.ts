import * as z from 'zod'
import { ScrapeTarget } from '~~/shared/prisma/enums'

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

    const status = await prisma.scrapeStatus.findUnique({
      where: {
        targetId_targetType: {
          targetId: params.id,
          targetType: ScrapeTarget.chapters
        }
      }
    })

    const lastRefreshed = status?.refreshedAt ?? new Date(0)
    const stale = Date.now() - lastRefreshed.getTime() > 1000 * 60 * 60

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