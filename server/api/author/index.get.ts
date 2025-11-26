export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      name: zName.optional(),
      "order[name]": zOrderDirection.optional(),
    }).parse,
  );

  const cacheKey = `author:list:${JSON.stringify(query)}`;
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

  if (query.name) {
    esQuery.bool.must.push({
      match_phrase_prefix: { "attributes.name": query.name },
    });
  }

  const sort: any = [];
  if (query["order[name]"]) {
    sort.push({ "attributes.name": { order: query["order[name]"] } });
  }

  const { hits, total } = await esSearch("authors", {
    query: esQuery,
    from: query.offset,
    size: query.limit,
    sort,
  });

  const expanded = await Promise.all(
    hits.map((hit) => expandRelationships(hit, query["includes[]"])),
  );

  const response = {
    result: "ok",
    data: expanded,
    limit: query.limit,
    offset: query.offset,
    count: total,
  };

  await setCache(cacheKey, response);

  return response;
});
