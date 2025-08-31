export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const ids: string[] = Array.isArray(query['ids[]'])
    ? query['ids[]']
    : query['ids[]']
    ? [query['ids[]']]
    : [];

  if (ids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No ids provided'
    });
  }

  const includes = Array.isArray(query['includes[]'])
    ? query['includes[]']
    : query['includes[]']
    ? [query['includes[]']]
    : [];

  const chapters = await prisma.scrapedChapters.findMany({
    where: { id: { in: ids } },
    include: { scrapedMangas: includes.includes('manga') },
  });

  if (chapters.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter(s) not found'
    });
  }

  return chapters;
});
