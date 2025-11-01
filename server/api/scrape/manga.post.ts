import { z } from 'zod'
import { formatScrapedManga } from '~~/server/utils/formatResponse'
import { ScrapeTarget } from '~~/shared/prisma/enums'

const scrapeMangaSchema = z.object({
  sourceId: z.string()
    .min(2, { message: "sourceId must be at least 2 characters" })
    .max(40, { message: "sourceId can not exceed 40 characters"} ).trim(),
  title: z.string()
    .min(1,{ message: "title must be at least 1 character" })
    .max(500, { message: "title can not exceed 500 characters" }).trim(),
  mangadexId: z.string().uuid({ message: "mangadexId must be a valid UUID" })
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, scrapeMangaSchema.parse)

  try {
    const result = await prisma.scrapedManga.findMany({
      where: {
        sourceId: body.sourceId,
        mangaDexId: body.mangadexId
      }
    })

    if (!(result.length > 0)) {
      return {
        result: "ok",
        data: (await refreshManga(body)).map(formatScrapedManga)
      }
    }

    const status = await prisma.scrapeStatus.findUnique({
      where: {
        targetId_targetType: {
          targetId: body.mangadexId,
          targetType: ScrapeTarget.manga
        }
      }
    })

    const lastRefreshed = status?.refreshedAt ?? new Date(0)
    const stale = Date.now() - lastRefreshed.getTime() > 1000 * 60 * 60

    if (stale) {
      refreshManga(body).catch((err: any) => {
        console.error(`Background refresh failed for manga title ${body.title} (${body.sourceId})`, err)
      })
    }

    return {
      result: "ok",
      data: result.map(formatScrapedManga)
    }

  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({
      statusCode: 500,
      statusMessage: err instanceof Error ? err.message : String(err)
    })
  }
})