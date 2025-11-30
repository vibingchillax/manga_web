export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      name: zName.optional(),
      focusedLanguage: zLang.optional(),
    }).parse,
  );

  const cacheKey = `scanlation_groups:list:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const esQuery: any = { bool: { must: [] } };

  if (query["ids[]"]?.length) {
    esQuery.bool.must.push({ terms: { id: query["ids[]"] } });
  }

  if (query.name) {
    esQuery.bool.must.push({
      match_phrase_prefix: { "attributes.name": query.name },
    });
  }

  if (query.focusedLanguage) {
    esQuery.bool.must.push({
      terms: { "attributes.focusedLanguages": query.focusedLanguage },
    });
  }

  const { hits, total } = await esSearch("scanlation_groups", {
    query: esQuery,
    size: query.limit,
    from: query.offset,
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
