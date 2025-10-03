import { randomUUID } from 'crypto'

type MangaRequestBody = {
  sourceId: string
  title: string
  mangadexId: string
}

export async function refreshMangas(mangaInput: MangaRequestBody) {

  try {
    const scrapeNew = await sourcesInstance.runSourceForMangas({
      sourceId: mangaInput.sourceId,
      titleInput: mangaInput.title
    })

    if (!(scrapeNew.length > 0)) throw createError({
      statusCode: 404,
      statusMessage: `No manga found from ${mangaInput.sourceId} for ${mangaInput.title}`
    })

    const created = await prisma.scrapedManga.createManyAndReturn({
      data: scrapeNew.map(manga => ({
        id: randomUUID(),
        mangaDexId: mangaInput.mangadexId,
        sourceId: manga.sourceId,
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

  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError(err instanceof Error ? err.message : String(err))
  }
}