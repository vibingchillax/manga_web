import { formatGroup } from "~~/server/utils/formatResponse";

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
      name: zName.optional(),
      focusedLanguage: zLang.optional(), //why mangadex only allows to search 1 i have no idea
    }).parse,
  );

  const ids = query["ids[]"] as string[] | undefined;

  const filters = {
    id: ids ? { in: ids } : undefined,
    name: query.name ? { contains: query.name } : undefined,
    focusedLanguages: query.focusedLanguage
      ? { has: query.focusedLanguage }
      : undefined,
  };

  const [groups, total] = await Promise.all([
    await prisma.scanlationGroup.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: filters,
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                roles: true,
              },
            },
            role: true,
          },
        },
      },
    }),

    await prisma.scanlationGroup.count({
      where: filters,
    }),
  ]);

  return {
    result: "ok",
    data: groups.map(formatGroup),
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total,
  };
});
