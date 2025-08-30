import { randomUUID } from 'crypto';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameter: id'
    })
  }
  
  try {
    const chapters = await prisma.scrapedChapters.findMany({
      where: {
        mangaId: id
      }
    })
    if (chapters.length > 0) return chapters;

    const manga = await prisma.scrapedMangas.findUnique({
      where: {
        id
      }
    })

    if (!manga) throw new Error('Manga not found')

    const result = await sourcesInstance.runSourceForChapters({
      manga: {
        sourceId: manga?.sourceId,
        title: manga?.title,
        url: manga?.url
      }
    })

    if (!(result.length > 0)) throw new Error('Nothing found')

    const created = await prisma.scrapedChapters.createManyAndReturn({
      data: result.map(chapter => ({
        id: randomUUID(),
        mangaId: id,
        sourceId: chapter.sourceId,
        url: chapter.url,
        title: chapter.title,
        volume: chapter.volume,
        chapter: chapter.chapterNumber,
        translatedLanguage: chapter.translatedLanguage ?? "en",
        uploader: chapter.uploader,
        scanlationGroup: chapter.scanlationGroup,
        branch: chapter.branch,
        publishedAt: chapter.date
      }))
    })
    return created

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error)
    })
  }
})