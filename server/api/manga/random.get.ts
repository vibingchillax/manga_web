import { z } from "zod";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      "includedTags[]": zArrayable(zUuid).optional(),
      includedTagsMode: z.enum(["AND", "OR"]).optional(),
      "excludedTags[]": zArrayable(zUuid).optional(),
      excludedTagsMode: z.enum(["AND", "OR"]).optional(),
      "contentRating[]": zArrayable(zContentRating).default([
        "safe",
        "suggestive",
        "erotica",
      ]),
    }).parse,
  );

  const boolQuery = {
    bool: {
      must: [] as any[],
      must_not: [] as any[],
    },
  };

  if (query["includedTags[]"]?.length) {
    boolQuery.bool.must.push({
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
    boolQuery.bool.must_not.push({
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

  if (query["contentRating[]"]) {
    boolQuery.bool.must.push({
      terms: { "attributes.contentRating": query["contentRating[]"] },
    });
  }

  const esQuery = {
    function_score: {
      query: boolQuery,
      random_score: {},
    },
  };

  const { hits } = await esSearch("manga", {
    size: 1,
    query: esQuery,
  });

  if (!hits || !hits[0]) {
    return {
      result: "ko",
    };
  }

  const expanded = await expandRelationships(hits[0], query["includes[]"]);

  const response = {
    result: "ok",
    data: expanded,
  };

  return response;
});
