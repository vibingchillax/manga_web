import { z } from "zod";

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

  const user = await getAuthenticatedUser(event);

  const cacheKey = `manga:${params.id}:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    await incrementView(
      "manga",
      params.id,
      user?.id,
      event.context.clientIp,
      event.context.userAgent,
    );
    return cached;
  }

  const manga = await esGetById("manga", params.id);

  if (!manga) {
    throw createError({
      statusCode: 404,
      statusMessage: "Manga not found",
    });
  }

  await incrementView(
    "manga",
    params.id,
    user?.id,
    event.context.clientIp,
    event.context.userAgent,
  );

  const expanded = await expandRelationships(manga, query["includes[]"]);

  const response = {
    result: "ok",
    data: expanded,
  };

  await setCache(cacheKey, response);

  return response;
});
