import type { ContentRating, ScanlationGroup } from "~~/shared/prisma/client";
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
  const originalLanguage = query["originalLanguage[]"] as string[] | undefined;
  const contentRating = query["contentRating[]"] as ContentRating[] | undefined;
  const excludedOriginalLanguage = query["excludedOriginalLanguage[]"] as
    | string[]
    | undefined;
  const groups = query["groups[]"] as string[] | undefined;
  const excludedUploaders = query["excludedUploaders[]"] as
    | string[]
    | undefined;
  const excludedGroups = query["excludedGroups[]"] as string[] | undefined;

  const filters: UploadedChapterWhereInput = {};
  filters.manga = {};
  if (ids) filters.id = { in: ids };
  if (query.title)
    filters.title = { contains: query.title, mode: "insensitive" };
  if (query.uploader) filters.uploader = query.uploader;
  if (query.manga) filters.mangaId = query.manga;
  if (volumes) filters.volume = { in: volumes };
  if (query.chapter) filters.chapter = query.chapter;
  if (translatedLanguages)
    filters.translatedLanguage = { in: translatedLanguages };
  if (query["originalLanguage[]"])
    filters.manga.originalLanguage = { in: originalLanguage };
  if (query["contentRating[]"])
    filters.manga.contentRating = { in: contentRating };
  if (query.createdAtSince)
    filters.createdAt = { gte: new Date(query.createdAtSince) };
  if (query.updatedAtSince)
    filters.createdAt = { gte: new Date(query.updatedAtSince) };
  if (query.publishAtSince)
    filters.createdAt = { gte: new Date(query.publishAtSince) };
  if (excludedOriginalLanguage)
    filters.manga.originalLanguage = { notIn: excludedOriginalLanguage };

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
    prisma.uploadedChapter.findMany({
      take: query.limit,
      skip: query.offset,
      where: filters,
      include: {
        manga: query["includes[]"]?.includes("manga"),
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

    prisma.uploadedChapter.count({
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
    limit: query.limit,
    offset: query.offset,
    count: total,
  };
});
