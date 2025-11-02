import { z } from "zod";
import { formatScrapedManga } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const manga = await prisma.scrapedManga.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!manga) {
    throw createError({
      statusCode: 404,
      statusMessage: "Manga not found",
    });
  }

  return {
    result: "ok",
    data: formatScrapedManga(manga),
  };
});
