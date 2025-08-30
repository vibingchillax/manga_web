import { randomUUID } from 'crypto';

type MangaRequestBody = {
  sourceId: string,
  title: string
  mangadexId: string
}

export default defineEventHandler(async (event) => {
  const body: MangaRequestBody = await readBody(event);
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

    if (result.length > 0) return result;

    const scrapeNew =  await sourcesInstance.runSourceForMangas({
      sourceId: body.sourceId,
      titleInput: body.title
    })

    const created = await prisma.scrapedMangas.createManyAndReturn({
      data: scrapeNew.map(manga => ({
        id: randomUUID(),
        mangaDexId: body.mangadexId,
        sourceId: body.sourceId,
        title: manga.title,
        url: manga.url,
        altTitles: manga.altTitles,
        description: manga.description,
        coverUrl: manga.coverUrl,
        author: manga.author,
        artist: manga.artist,
        publicationDemographic: manga.publicationDemographic,
        status: manga.status,
        year: manga.year,
        contentRating: manga.contentRating,
        tags: manga.tags,
        originalLanguage: manga.originalLanguage
      })),
      skipDuplicates: true
    })

    return created
  } catch (err) {
    throw createError(err instanceof Error ? err.message : String(err));
  }
})