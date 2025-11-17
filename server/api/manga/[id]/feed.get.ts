import type { ContentRating, ScanlationGroup } from "~~/shared/prisma/client";
import type {
  UploadedChapterOrderByWithRelationInput,
  UploadedChapterWhereInput,
} from "~~/shared/prisma/models";
import type { Enumerable } from "~~/shared/prisma/internal/prismaNamespace";
import { ChapterQueryResult } from "~~/server/api/chapter/[id]/index.get";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const query = await getValidatedQuery(
    event,
    baseQuerySchema.extend({
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

  const translatedLanguages = query["translatedLanguage[]"] as
    | string[]
    | undefined;
  const originalLanguage = query["originalLanguage[]"] as string[] | undefined;
  const contentRating = query["contentRating[]"] as ContentRating[] | undefined;
  const excludedOriginalLanguage = query["excludedOriginalLanguage[]"] as
    | string[]
    | undefined;
  const excludedUploaders = query["excludedUploaders[]"] as
    | string[]
    | undefined;
  const excludedGroups = query["excludedGroups[]"] as string[] | undefined;

  const filters: UploadedChapterWhereInput = {};
  filters.manga = {};
  filters.mangaId = params.id;
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

  if (query["excludedGroups[]"]?.length) {
    filters.groups = {};
    filters.groups["none"] = { groupId: { in: excludedGroups } };
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
