import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, z.object({
    'ids[]': z.union([z.string().uuid(), z.array(z.string().uuid())]).transform(val => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    }),
    'includes[]': z.union([z.string(), z.array(z.string())]).optional().transform(val => {
      if (!val) return undefined
      return Array.isArray(val) ? val : [val]
    })
  }).parse)

  const chapters = await prisma.scrapedChapter.findMany({
    where: { id: { in: query["ids[]"] } },
    include: { manga: query["includes[]"]?.includes("manga") },
  });

  if (chapters.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter(s) not found'
    });
  }

  return chapters;
});
