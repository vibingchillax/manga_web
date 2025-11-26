import { z } from "zod";

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

  const cacheKey = `author:${params.id}:${query["includes[]"]?.join(",")}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const author = await esGetById("authors", params.id);

  if (!author)
    throw createError({
      statusCode: 404,
      statusMessage: "Author not found",
    });

  const expanded = await expandRelationships(author, query["includes[]"]);

  const response = {
    result: "ok",
    data: expanded,
  };

  await setCache(cacheKey, response);

  return response;
});
