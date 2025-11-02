import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: zUuid
  }).parse)

  const query = await getValidatedQuery(event, z.object({
    'translatedLanguage[]': zArrayable(zLang).optional(),
    'groups[]': zArrayable(zUuid).optional()
  }).parse)

  const translatedLanguage = query['translatedLanguage[]'] as string[]
  const groups = query['groups[]'] as string[]

  const chapters = await prisma.uploadedChapter.findMany({
    where: {
      mangaId: params.id,
      ...(translatedLanguage?.length
        ? { translatedLanguage: { in: translatedLanguage } }
        : {}),
      ...(groups?.length
        ? {
          groups: {
            some: { groupId: { in: groups } },
          },
        }
        : {}),
    },
    include: {
      groups: {
        select: { groupId: true },
      },
    },
    orderBy: [
      { volume: 'asc' },
      { chapter: 'asc' },
      { createdAt: 'asc' },
    ],
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

  return {
    result: "ok",
    volumes: volumes
  };
})