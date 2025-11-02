import { z } from "zod";
import { formatScrapedChapter } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    z.object({
      "ids[]": zArrayable(zUuid).optional(),
      "includes[]": zArrayable(z.string()).optional(),
    }).parse,
  );

  const ids = query["ids[]"] as string[] | undefined;

  const chapters = await prisma.scrapedChapter.findMany({
    where: { id: { in: ids } },
    include: { manga: query["includes[]"]?.includes("manga") },
  });

  if (chapters.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chapter(s) not found",
    });
  }

  return chapters.map(formatScrapedChapter);
});
