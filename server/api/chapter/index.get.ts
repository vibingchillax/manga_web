export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      title: zTitle.optional(),
      "groups[]": zArrayable(zUuid).optional(),
      uploader: zUuid.optional(),
      manga: zUuid.optional(),
      "volume[]": zArrayable(zVolume).optional(),
      chapter: zChapter.optional(),
      "translatedLanguage[]": zArrayable(zLang).optional(),
      "originalLanguage[]": zArrayable(zLang).optional(),
      "excludedOriginalLanguage[]": zArrayable(zLang).optional(),
      "contentRating[]": zArrayable(zContentRating).default([
        "safe",
        "suggestive",
        "erotica",
      ]),
      "excludedGroups[]": zArrayable(zUuid).optional(),
      "excludedUploaders[]": zArrayable(zUuid).optional(),
      createdAtSince: zDateString.optional(),
      updatedAtSince: zDateString.optional(),
      publishAtSince: zDateString.optional(),
      "order[createdAt]": zOrderDirection.optional(),
      "order[updatedAt]": zOrderDirection.optional(),
      "order[publishAt]": zOrderDirection.optional(),
      "order[readableAt]": zOrderDirection.optional(),
      "order[volume]": zOrderDirection.optional(),
      "order[chapter]": zOrderDirection.optional(),
    }).parse,
  );

  const cacheKey = `chapter:list:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const esQuery: any = { bool: { must: [], must_not: [] as any[] } };

  if (query["ids[]"]?.length) {
    esQuery.bool.must.push({ terms: { id: query["ids[]"] } });
  }

  if (query.title) {
    esQuery.bool.must.push({
      match_phrase_prefix: { "attributes.title": query.title },
    });
  }

  if (query.uploader) {
    esQuery.bool.must.push(nestedRelationship("user", [query.uploader]));
  }

  if (query.manga) {
    esQuery.bool.must.push(nestedRelationship("manga", [query.manga]));
  }

  if (query["volume[]"]?.length) {
    esQuery.bool.must.push({
      terms: { "attributes.volume.keyword": query["volume[]"] },
    });
  }

  if (query.chapter) {
    esQuery.bool.must.push({
      term: { "attributes.chapter.keyword": query.chapter },
    });
  }

  if (query["translatedLanguage[]"]?.length) {
    esQuery.bool.must.push({
      terms: { "attributes.translatedLanguage": query["translatedLanguage[]"] },
    });
  }

  if (query["originalLanguage[]"]?.length) {
    esQuery.bool.must.push({
      terms: { "attributes.originalLanguage": query["originalLanguage[]"] },
    });
  }

  if (query["excludedOriginalLanguage[]"]?.length) {
    esQuery.bool.must_not.push({
      terms: {
        "attributes.originalLanguage": query["excludedOriginalLanguage[]"],
      },
    });
  }

  if (query["contentRating[]"]?.length) {
    esQuery.bool.must.push({
      terms: { "attributes.contentRating": query["contentRating[]"] },
    });
  }

  if (query["excludedUploaders[]"]?.length) {
    esQuery.bool.must_not.push(
      nestedRelationship("user", query["excludedUploaders[]"]),
    );
  }

  if (query.createdAtSince) {
    esQuery.bool.must.push({
      range: {
        "attributes.createdAt": {
          gte: new Date(query.createdAtSince).toISOString(),
        },
      },
    });
  }

  if (query.updatedAtSince) {
    esQuery.bool.must.push({
      range: {
        "attributes.updatedAt": {
          gte: new Date(query.updatedAtSince).toISOString(),
        },
      },
    });
  }

  if (query.publishAtSince) {
    esQuery.bool.must.push({
      range: {
        "attributes.publishAt": {
          gte: new Date(query.publishAtSince).toISOString(),
        },
      },
    });
  }

  if (query["groups[]"]?.length) {
    esQuery.bool.must.push(
      nestedRelationship("scanlation_group", query["groups[]"]),
    );
  }

  if (query["excludedGroups[]"]?.length) {
    esQuery.bool.must_not.push(
      nestedRelationship("scanlation_group", query["excludedGroups[]"]),
    );
  }

  const sort: any[] = [];
  (
    [
      "createdAt",
      "updatedAt",
      "publishAt",
      "readableAt",
      "volume",
      "chapter",
    ] as const
  ).forEach((field) => {
    const dir = query[`order[${field}]`];
    const f = "attributes." + field;
    if (dir) sort.push({ [f]: { order: dir } });
  });

  const { hits, total } = await esSearch("chapters", {
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
