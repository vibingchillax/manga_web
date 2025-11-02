import { formatCoverArt } from "~~/server/utils/formatResponse";
import type { Enumerable } from "~~/shared/prisma/internal/prismaNamespace";
import type {
  CoverArtOrderByWithRelationInput,
  CoverArtWhereInput,
} from "~~/shared/prisma/models";

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

  const ids = query["ids[]"] as string[] | undefined;
  const mangaIds = query["manga[]"] as string[] | undefined;
  const uploaders = query["uploaders[]"] as string[] | undefined;
  const locales = query["locales[]"] as string[] | undefined;

  const filters: CoverArtWhereInput = {
    id: ids ? { in: ids } : undefined,
    mangaId: mangaIds ? { in: mangaIds } : undefined,
    uploader: uploaders ? { in: uploaders } : undefined,
    locale: locales ? { in: locales } : undefined,
  };

  const orderBy: Enumerable<CoverArtOrderByWithRelationInput> = [];

  (["createdAt", "updatedAt", "volume"] as const).forEach((field) => {
    const key = `order[${field}]` as const;
    const dir = query[key];
    if (dir) {
      orderBy.push({ [field]: dir });
    }
  });

  const [covers, total] = await Promise.all([
    await prisma.coverArt.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: filters,
      include: {
        user: query["includes[]"]?.includes("user")
          ? {
              select: {
                id: true,
                username: true,
                roles: true,
              },
            }
          : undefined,
        //manga
      },
      orderBy: orderBy,
    }),

    await prisma.coverArt.count({
      where: filters,
    }),
  ]);

  return {
    result: "ok",
    data: covers.map(formatCoverArt),
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total,
  };
});
