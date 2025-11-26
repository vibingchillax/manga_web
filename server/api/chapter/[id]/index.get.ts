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

  const cacheKey = `chapter:${params.id}:${query["includes[]"]?.join(",")}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    await incrementView(
      "chapter",
      params.id,
      user?.id,
      event.context.clientIp,
      event.context.userAgent,
    );
    return cached;
  }

  const chapter = await esGetById("chapters", params.id);

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chapter not found",
    });
  }

  const expanded = await expandRelationships(chapter, query["includes[]"]);

  await incrementView(
    "chapter",
    params.id,
    user?.id,
    event.context.clientIp,
    event.context.userAgent,
  );

  const response = {
    result: "ok",
    data: expanded,
  };

  await setCache(cacheKey, response);

  return response;
});
