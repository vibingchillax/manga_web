export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const param = getQuery(event);
  const translatedLanguage = Array.isArray(param['translatedLanguage[]']) ? param['translatedLanguage[]'] : param['translatedLanguage[]'] ? [param['translatedLanguage[]']] : []

  const chapters = await prisma.scrapedChapters.findMany({
    where: {
      mangaId: id,
      ...(translatedLanguage.length > 0 && {
        translatedLanguage: {
          in: translatedLanguage
        }
      })
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