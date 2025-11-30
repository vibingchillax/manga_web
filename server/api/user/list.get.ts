import { paginationSchema } from "~~/shared/utils/zodHelper";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const query = await getValidatedQuery(event, paginationSchema.parse);

  const cacheKey = `custom_list:user:${user.id}:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const esQuery = {
    bool: {
      must: [nestedRelationship("user", [user.id])],
    },
  };

  const { hits, total } = await esSearch("custom_lists", {
    query: esQuery,
    from: query.offset,
    size: query.limit,
  });

  const response = {
    result: "ok",
    data: hits,
    limit: query.limit,
    offset: query.offset,
    total: total,
  };

  await setCache(cacheKey, response);

  return response;
});
