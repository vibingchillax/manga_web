type MangaRequestBody = {
  sourceId: string
  title: string
  mangadexId: string
}

export default defineEventHandler(async (event) => {
  const body: MangaRequestBody = await readBody(event)
  if (!body.sourceId || !body.title || !body.mangadexId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: title, sourceId, mangadexId'
    })
  }
  try {
    const result = await prisma.scrapedMangas.findMany({
      where: {
        sourceId: body.sourceId,
        mangaDexId: body.mangadexId
      }
    })

    if (!(result.length > 0)) {
      return await refreshMangas(body)
    }

    const lastUpdated = result[0].updatedAt
    const stale = Date.now() - lastUpdated.getTime() > 1000 * 60 * 60

    if (stale) {
      refreshMangas(body).catch((err: any) => {
        console.error(`Background refresh failed for manga title ${body.title} (${body.sourceId})`, err)
      })
    }

    return result

  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError(err instanceof Error ? err.message : String(err))
  }
})