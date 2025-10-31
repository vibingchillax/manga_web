import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
  }).parse)

  const query = await getValidatedQuery(event, z.object({
    'translatedLanguage[]': zArrayable(zLang).optional()
  }).safeParse)

  const translatedLanguage = query.data?.['translatedLanguage[]'] as string[]

  const chapters = await prisma.scrapedChapter.findMany({
    where: {
      mangaId: params.id,
      translatedLanguage: translatedLanguage ? { in: translatedLanguage }
        : undefined
    },
    orderBy: {
      chapter: 'desc'
    }
  })
  const volumes: Record<string, any> = {}

  for (const ch of chapters) {
    const volume = ch.volume ?? 'none';
    const chapterKey = ch.chapter ?? 'none';

    if (!volumes[volume]) {
      volumes[volume] = {
        volume,
        count: 0,
        chapters: {}
      };
    }

    if (!volumes[volume].chapters[chapterKey]) {
      volumes[volume].chapters[chapterKey] = {
        chapter: chapterKey,
        id: ch.id,
        others: [],
        count: 0
      };
    } else {
      volumes[volume].chapters[chapterKey].others.push(ch.id);
    }

    volumes[volume].chapters[chapterKey].count++;
    volumes[volume].count++;
  }

  return volumes;
})