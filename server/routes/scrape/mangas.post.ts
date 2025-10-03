import * as z from 'zod'

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
  const body = scrapeMangaSchema.safeParse(await readBody(event))

  if (!body.success) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request data',
    data: body.error.flatten()
  })

  const data = body.data

  try {
    const result = await prisma.scrapedManga.findMany({
      where: {
        sourceId: data.sourceId,
        mangaDexId: data.mangadexId
      }
    })

    if (!(result.length > 0)) {
      return await refreshMangas(data)
    }

    const lastUpdated = result[0].updatedAt
    const stale = Date.now() - lastUpdated.getTime() > 1000 * 60 * 60

    if (stale) {
      refreshMangas(data).catch((err: any) => {
        console.error(`Background refresh failed for manga title ${data.title} (${data.sourceId})`, err)
      })
    }

    return result

  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError(err instanceof Error ? err.message : String(err))
  }
})