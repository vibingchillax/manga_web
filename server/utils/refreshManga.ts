import { randomUUID } from 'crypto'
import { ScrapeTarget } from '~~/shared/prisma/enums'

type MangaRequestBody = {
  sourceId: string
  title: string
  mangadexId: string
}

export async function refreshManga(mangaInput: MangaRequestBody) {

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

  await prisma.scrapeStatus.upsert({
    where: {
      targetId_targetType: {
        targetId: mangaInput.mangadexId,
        targetType: ScrapeTarget.manga,
      },
    },
    update: {
      refreshedAt: new Date()
    },
    create: {
      id: randomUUID(),
      targetId: mangaInput.mangadexId,
      targetType: ScrapeTarget.manga,
      refreshedAt: new Date()
    }
  })

  return created

}