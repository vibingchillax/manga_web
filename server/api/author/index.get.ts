import { formatAuthor } from "~~/server/utils/formatResponse";
import type { SortOrder } from "~~/shared/prisma/internal/prismaNamespace";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      name: zName.optional(),
      "order[name]": zOrderDirection.optional(),
    }).parse,
  );

  const ids = query["ids[]"] as string[] | undefined;

  const filters = {
    id: ids ? { in: ids } : undefined,
    name: query.name ? { contains: query.name } : undefined,
  };

  const orderBy = query["order[name]"]
    ? { name: query["order[name]"] as SortOrder }
    : undefined;

  const [authors, total] = await Promise.all([
    await prisma.author.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: filters,
      orderBy: orderBy,
      // include: {
      //   manga: true
      // }
    }),

    await prisma.author.count({
      where: filters,
    }),
  ]);

  return {
    result: "ok",
    data: authors.map((a) => formatAuthor),
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total,
  };
});
