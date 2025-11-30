export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      "manga[]": zArrayable(zUuid).optional(),
      "uploaders[]": zArrayable(zUuid).optional(),
      "locales[]": zArrayable(zLang).optional(),
      "order[createdAt]": zOrderDirection.optional(),
      "order[updatedAt]": zOrderDirection.optional(),
      "order[volume]": zOrderDirection.optional(),
    }).parse,
  );

  const cacheKey = `cover:list:${JSON.stringify(query)}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const esQuery: any = { bool: { must: [] } };

  if (query["ids[]"]?.length) {
    esQuery.bool.must.push({ terms: { id: query["ids[]"] } });
  }

  if (query["manga[]"]?.length) {
    esQuery.bool.must.push(nestedRelationship("manga", query["manga[]"]));
  }

  if (query["uploaders[]"]?.length) {
    esQuery.bool.must.push(nestedRelationship("user", query["uploaders[]"]));
  }

  if (query["locales[]"]?.length) {
    esQuery.bool.must.push({
      terms: { "attributes.locale": query["locales[]"] },
    });
  }

  const sort: any[] = [];

  (["createdAt", "updatedAt", "volume"] as const).forEach((field) => {
    const dir = query[`order[${field}]`];
    const f = "attributes." + field;
    if (dir) sort.push({ [f]: { order: dir } });
  });

  const { hits, total } = await esSearch("covers", {
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
    total: total,
  };

  await setCache(cacheKey, response);

  return response;
});
