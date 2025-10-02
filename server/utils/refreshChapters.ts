import { randomUUID } from 'crypto';
import { scrapedMangas } from '~~/shared/prisma/client';

export async function refreshChapters(manga: scrapedMangas) {

  const result = await sourcesInstance.runSourceForChapters({
    manga: {
      sourceId: manga.sourceId,
      title: manga.title,
      url: manga.url
    }
  })

  if (!(result.length > 0)) throw createError({
    statusCode: 404,
    statusMessage: `No chapters found from ${manga.sourceId} for ${manga.title}`
  })

  const created = await prisma.scrapedChapters.createManyAndReturn({
    data: result.map(chapter => ({
      id: randomUUID(),
      mangaId: manga.id,
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
    })),
    skipDuplicates: true
  })

  return created
}