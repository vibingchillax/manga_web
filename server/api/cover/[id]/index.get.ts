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

  const key = `cover:${params.id}:${query["includes[]"]?.join(",")}`;
  const cached = await getCache(key);
  if (cached) return cached;

  const cover = await esGetById("covers", params.id);

  if (!cover)
    throw createError({
      statusCode: 404,
      statusMessage: "Cover not found",
    });

  const expanded = await expandRelationships(cover, query["includes[]"]);

  const response = {
    result: "ok",
    data: expanded,
  };

  await setCache(key, response);

  return response;
});
