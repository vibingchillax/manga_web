import { z } from "zod";
import { formatManga } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const query = await getValidatedQuery(
    event,
    z.object({
      "includes[]": zArrayable(z.string()).optional(),
    }).parse,
  );

  const result = await prisma.manga.findUnique({
    where: {
      id: params.id,
    },
    include: {
      authors: query["includes[]"]?.includes("author"),
      artists: query["includes[]"]?.includes("artist"),
      covers: query["includes[]"]?.includes("cover_art")
        ? {
            where: { isMain: true },
          }
        : false,
      relationsTo: query["includes[]"]?.includes("manga")
        ? {
            include: {
              to: true,
            },
          }
        : true,
      chapters: {
        select: {
          id: true,
        },
        orderBy: {
          publishAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: "Manga not found",
    });
  }

  const languagesRows = await prisma.uploadedChapter.groupBy({
    by: ["translatedLanguage"],
    where: { mangaId: params.id },
    _count: true,
  });

  const availableTranslatedLanguages = languagesRows.map(
    (row) => row.translatedLanguage,
  );

  return {
    result: "ok",
    data: formatManga(
      result,
      result.chapters?.[0].id ?? null,
      availableTranslatedLanguages,
    ),
  };
});
