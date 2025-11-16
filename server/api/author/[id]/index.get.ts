import { z } from "zod";
import { formatAuthor } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({ id: zUuid }).parse,
  );

  const query = await getValidatedQuery(
    event,
    z.object({
      "includes[]": zArrayable(z.string()).optional(),
    }).parse,
  );

  const author = await prisma.author.findUnique({
    where: {
      id: params.id,
    },
    include: {
      mangaAuthored: query["includes[]"]?.includes("manga"),
      mangaDrawn: query["includes[]"]?.includes("manga"),
    },
  });

  if (!author)
    throw createError({
      statusCode: 404,
      statusMessage: "Author not found",
    });

  return {
    result: "ok",
    data: formatAuthor(author),
  };
});
