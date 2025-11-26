import { z } from "zod";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const query = await getValidatedQuery(event, paginationSchema.parse);

  const user = await getAuthenticatedUser(event);

  const seePrivate =
    user?.id === params.id || user?.roles.includes(UserRole.admin);

  const cacheKey = `custom_lists:user:${params.id}:${seePrivate ? "all" : "public"}:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const filters: any[] = [nestedRelationship("user", [params.id])];

  if (!seePrivate) {
    filters.push({
      term: { "attributes.visibility": "public" },
    });
  }

  const esQuery = {
    bool: {
      must: filters,
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
    count: total,
  };

  await setCache(cacheKey, response);

  return response;
});
