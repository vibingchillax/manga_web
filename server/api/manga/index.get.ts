import { z } from "zod";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      title: zName.optional(), // zTitle?
      authorOrArtist: zUuid.optional(),
      "authors[]": zArrayable(zUuid).optional(),
      "artists[]": zArrayable(zUuid).optional(),
      year: z.number().optional(),
      "includedTags[]": zArrayable(zUuid).optional(),
      includedTagsMode: z.enum(["AND", "OR"]).optional(),
      "excludedTags[]": zArrayable(zUuid).optional(),
      excludedTagsMode: z.enum(["AND", "OR"]).optional(),
      status: zMangaStatus.optional(),
      "originalLanguage[]": zArrayable(zLang).optional(),
      "excludedOriginalLanguage[]": zArrayable(zLang).optional(),
      "availableTranslatedLanguage[]": zArrayable(zLang).optional(),
      "publicationDemographic[]": zArrayable(
        zPublicationDemographic,
      ).optional(),
      "contentRating[]": zArrayable(zContentRating).default([
        "safe",
        "suggestive",
        "erotica",
      ]),
      createdAtSince: zDateString.optional(),
      updatedAtSince: zDateString.optional(),
      "order[latestUploadedChapter]": zOrderDirection.optional(),
      // group: zUuid.optional(), ???
    }).parse,
  );

  const cacheKey = `manga:list:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const esQuery: any = { bool: { must: [], must_not: [] as any[] } };

  if (query["ids[]"]) {
    esQuery.bool.must.push({ terms: { id: query["ids[]"] } });
  }

  if (query.title) {
    esQuery.bool.must.push({
      match_phrase_prefix: { "attributes.title": query.title },
    });
  }

  if (query.authorOrArtist) {
    esQuery.bool.should = [
      nestedRelationship("author", [query.authorOrArtist]),
      nestedRelationship("artist", [query.authorOrArtist]),
    ];
    esQuery.bool.minimum_should_match = 1;
  }
  if (query["authors[]"])
    esQuery.bool.must.push(nestedRelationship("author", query["authors[]"]));
  if (query["artists[]"])
    esQuery.bool.must.push(nestedRelationship("artist", query["artists[]"]));

  if (query.year) {
    esQuery.bool.must.push({ terms: { "attributes.year": query.year } });
  }
  if (query["includedTags[]"]?.length) {
    esQuery.bool.must.push({
      nested: {
        path: "attributes.tags",
        query: {
          bool: {
            [query.includedTagsMode === "AND" ? "must" : "should"]: query[
              "includedTags[]"
            ].map((id) => ({
              term: { "attributes.tags.id": id },
            })),
          },
        },
      },
    });
  }

  if (query["excludedTags[]"]?.length) {
    esQuery.bool.must_not.push({
      nested: {
        path: "attributes.tags",
        query: {
          bool: {
            [query.excludedTagsMode === "AND" ? "must" : "should"]: query[
              "excludedTags[]"
            ].map((id) => ({
              term: { "attributes.tags.id": id },
            })),
          },
        },
      },
    });
  }

  if (query.status) {
    esQuery.bool.must.push({ terms: { "attributes.status": query.status } });
  }

  if (query["originalLanguage[]"]) {
    esQuery.bool.must.push({
      terms: { "attributes.originalLanguage": query["originalLanguage[]"] },
    });
  }

  if (query["excludedOriginalLanguage[]"])
    esQuery.bool.must_not.push({
      terms: {
        "attributes.originalLanguage": query["excludedOriginalLanguage[]"],
      },
    });

  if (query["publicationDemographic[]"]) {
    esQuery.bool.must.push({
      terms: {
        "attributes.publicationDemographic": query["publicationDemographic[]"],
      },
    });
  }

  if (query["contentRating[]"]) {
    esQuery.bool.must.push({
      terms: { "attributes.contentRating": query["contentRating[]"] },
    });
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
  const sort: any[] = [];
  if (query["order[latestUploadedChapter]"]) {
    // incorrect, we probably should store latest uploaded chapter timestamp
    sort.push({
      "attributes.latestUploadedChapter": {
        order: query["order[latestUploadedChapter]"],
      },
    });
  }
  const { hits, total } = await esSearch("manga", {
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
