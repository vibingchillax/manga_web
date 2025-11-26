const querySchema = baseQuerySchema.extend({
  username: zName.optional(),
  "order[username]": zOrderDirection.optional(),
});

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const query = await getValidatedQuery(event, querySchema.parse);

  const cacheKey = `user:list:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const esQuery: any = {
    bool: {
      must: [] as any[],
    },
  };

  if (query["ids[]"]?.length) {
    esQuery.bool.must.push({ terms: { id: query["ids[]"] } });
  }

  if (query.username) {
    esQuery.bool.must.push({
      match_phrase_prefix: { "attributes.username": query.username },
    });
  }

  const sort: any = [];
  if (query["order[username]"]) {
    sort.push({ "attributes.username": { order: query["order[username]"] } });
  }

  const { hits, total } = await esSearch("users", {
    query: esQuery,
    from: query.offset,
    size: query.limit,
    sort,
  });

  const response = {
    result: "ok",
    data: hits,
    limit: query.limit,
    offset: query.offset,
    count: total,
  };

  await setCache(cacheKey, response);

  return response;
});
