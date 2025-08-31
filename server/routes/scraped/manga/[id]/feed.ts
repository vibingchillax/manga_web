export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: id'
    })
  }
  
  try {
    const manga = await prisma.scrapedMangas.findUnique({
      where: {
        id
      }
    })

    if (!manga) throw createError({
      statusCode: 404,
      statusMessage: 'Manga not found'
    })

    const result = await prisma.scrapedChapters.findMany({
      where: {
        mangaId: id
      }
    })

    if (!(result.length > 0)) {
      return await refreshChapters(manga)
    }

    const lastUpdated = result[0].updatedAt
    const stale = Date.now() - lastUpdated.getTime() > 1000 * 60 * 60

    if (stale) {
      refreshChapters(manga).catch((err: any)=> {
        console.error(`Background refresh failed for manga ${id}`, err)
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