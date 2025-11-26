import { z } from "zod";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({ id: zUuid }).parse,
  );

  const cacheKey = `scanlation_group:${params.id}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const group = await esGetById("scanlation_groups", params.id);

  if (!group)
    throw createError({
      statusCode: 404,
      statusMessage: "Group not found",
    });

  const expanded = await expandRelationships(group, ["leader, member"]);

  const response = {
    result: "ok",
    data: expanded,
  };

  await setCache(cacheKey, response);

  return response;
});
