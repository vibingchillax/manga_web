import type { ScanlationGroup } from "~~/shared/prisma/client";
import type { ChapterQueryResult } from "./[id]/index.get";
import type {
  UploadedChapterOrderByWithRelationInput,
  UploadedChapterWhereInput,
} from "~~/shared/prisma/models";
import type { Enumerable } from "~~/shared/prisma/internal/prismaNamespace";

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
      "contentRating[]": zArrayable(zContentRating).optional(),
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

  const ids = query["ids[]"] as string[] | undefined;
  const volumes = query["volume[]"] as string[] | undefined;
  const translatedLanguages = query["translatedLanguage[]"] as
    | string[]
    | undefined;
  const groups = query["groups[]"] as string[] | undefined;
  const excludedUploaders = query["excludedUploaders[]"] as
    | string[]
    | undefined;
  const excludedGroups = query["excludedGroups[]"] as string[] | undefined;

  const filters: UploadedChapterWhereInput = {
    id: ids ? { in: ids } : undefined,
    title: query.title
      ? { contains: query.title, mode: "insensitive" }
      : undefined,
    uploader: query.uploader,
    mangaId: query.manga,
    volume: volumes ? { in: volumes } : undefined,
    chapter: query.chapter,
    translatedLanguage: translatedLanguages
      ? { in: translatedLanguages }
      : undefined,
    // originalLanguage: query.["originalLanguage[]"]
    //   ? { in: query."originalLanguage[]"] }
    //   : undefined,
    // contentRating: query.["contentRating[]"]
    //   ? { in: query."contentRating[]"] }
    //   : undefined,
    createdAt: query.createdAtSince
      ? { gte: new Date(query.createdAtSince) }
      : undefined,
    updatedAt: query.updatedAtSince
      ? { gte: new Date(query.updatedAtSince) }
      : undefined,
    publishAt: query.publishAtSince
      ? { gte: new Date(query.publishAtSince) }
      : undefined,
  };

  // if (query.data?.["excludedOriginalLanguage[]"]?.length) {
  //   filters.originalLanguage = { notIn: query.data["excludedOriginalLanguage[]"] };
  // }

  if (query["excludedUploaders[]"]?.length) {
    filters.uploader = { notIn: excludedUploaders };
  }

  if (query["groups[]"]?.length || query["excludedGroups[]"]?.length) {
    filters.groups = {};
    if (query["groups[]"]?.length) {
      filters.groups["some"] = { groupId: { in: groups } };
    }
    if (query["excludedGroups[]"]?.length) {
      filters.groups["none"] = { groupId: { in: excludedGroups } };
    }
  }

  const orderBy: Enumerable<UploadedChapterOrderByWithRelationInput> = [];

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
    const key = `order[${field}]` as const;
    const dir = query[key];
    if (dir) {
      orderBy.push({ [field]: dir });
    }
  });

  const [chapters, total]: [ChapterQueryResult[], number] = await Promise.all([
    await prisma.uploadedChapter.findMany({
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
        groups: query["includes[]"]?.includes("scanlation_group")
          ? {
              include: {
                group: true,
              },
            }
          : undefined,
      },
      orderBy: orderBy,
    }),

    await prisma.uploadedChapter.count({
      where: filters,
    }),
  ]);

  const formattedChapters = chapters.map((chapter) => {
    const flattenedGroups: ScanlationGroup[] =
      chapter.groups?.map((g) => g.group!).filter(Boolean) ?? [];

    return formatUploadedChapter({
      ...chapter,
      user: chapter.user
        ? ({
            id: chapter.user.id,
            username: chapter.user.username,
            roles: chapter.user.roles,
          } satisfies SafeUser)
        : undefined,
      groups: flattenedGroups,
    });
  });

  return {
    result: "ok",
    data: formattedChapters,
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total,
  };
});
