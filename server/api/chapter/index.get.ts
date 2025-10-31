import { ScanlationGroup } from "~~/shared/prisma/client"
import { ChapterQueryResult } from "./[id]/index.get"
import { UploadedChapterOrderByWithRelationInput, UploadedChapterWhereInput } from "~~/shared/prisma/models"
import { Enumerable } from "~~/shared/prisma/internal/prismaNamespace"

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, baseQuerySchema.extend({
    title: zTitle.optional(),
    'groups[]': zArrayable(zUuid).optional(),
    uploader: zUuid.optional(),
    manga: zUuid.optional(),
    'volume[]': zArrayable(zVolume).optional(),
    chapter: zChapter.optional(),
    'translatedLanguage[]': zArrayable(zLang).optional(),
    'originalLanguage[]': zArrayable(zLang).optional(),
    'excludedOriginalLanguage[]': zArrayable(zLang).optional(),
    'contentRating[]': zArrayable(zContentRating).optional(),
    'excludedGroups[]': zArrayable(zUuid).optional(),
    'excludedUploaders[]': zArrayable(zUuid).optional(),
    createdAtSince: zDateString.optional(),
    updatedAtSince: zDateString.optional(),
    publishAtSince: zDateString.optional(),
    'order[createdAt]': zOrderDirection.optional(),
    'order[updatedAt]': zOrderDirection.optional(),
    'order[publishAt]': zOrderDirection.optional(),
    'order[readableAt]': zOrderDirection.optional(),
    'order[volume]': zOrderDirection.optional(),
    'order[chapter]': zOrderDirection.optional(),

  }).safeParse)

  const ids = query.data?.["ids[]"] as string[] | undefined
  const volumes = query.data?.["volume[]"] as string[] | undefined
  const translatedLanguages = query.data?.["translatedLanguage[]"] as string[] | undefined
  const groups = query.data?.["groups[]"] as string[] | undefined
  const excludedUploaders = query.data?.["excludedUploaders[]"] as string[] | undefined
  const excludedGroups = query.data?.["excludedGroups[]"] as string[] | undefined

  const filters: UploadedChapterWhereInput = {
    id: ids ? { in: ids } : undefined,
    title: query.data?.title
      ? { contains: query.data.title, mode: "insensitive" }
      : undefined,
    uploader: query.data?.uploader,
    mangaId: query.data?.manga,
    volume: volumes ? { in: volumes } : undefined,
    chapter: query.data?.chapter,
    translatedLanguage: translatedLanguages
      ? { in: translatedLanguages }
      : undefined,
    // originalLanguage: query.data?.["originalLanguage[]"]
    //   ? { in: query.data["originalLanguage[]"] }
    //   : undefined,
    // contentRating: query.data?.["contentRating[]"]
    //   ? { in: query.data["contentRating[]"] }
    //   : undefined,
    createdAt: query.data?.createdAtSince
      ? { gte: new Date(query.data.createdAtSince) }
      : undefined,
    updatedAt: query.data?.updatedAtSince
      ? { gte: new Date(query.data.updatedAtSince) }
      : undefined,
    publishAt: query.data?.publishAtSince
      ? { gte: new Date(query.data.publishAtSince) }
      : undefined,
  };

  // if (query.data?.["excludedOriginalLanguage[]"]?.length) {
  //   filters.originalLanguage = { notIn: query.data["excludedOriginalLanguage[]"] };
  // }

  if (query.data?.["excludedUploaders[]"]?.length) {
    filters.uploader = { notIn: excludedUploaders };
  }

  if (query.data?.["groups[]"]?.length || query.data?.["excludedGroups[]"]?.length) {
    filters.groups = {};
    if (query.data?.["groups[]"]?.length) {
      filters.groups["some"] = { groupId: { in: groups } };
    }
    if (query.data?.["excludedGroups[]"]?.length) {
      filters.groups["none"] = { groupId: { in: excludedGroups } };
    }
  }

  const orderBy: Enumerable<UploadedChapterOrderByWithRelationInput> = [];

  ([
    "createdAt",
    "updatedAt",
    "publishAt",
    "readableAt",
    "volume",
    "chapter",
  ] as const).forEach((field) => {
    const key = `order[${field}]` as const;
    const dir = query.data?.[key];
    if (dir) {
      orderBy.push({ [field]: dir });
    }
  });

  const [chapters, total]: [ChapterQueryResult[], number] = await Promise.all([
    await prisma.uploadedChapter.findMany({
      take: query.data?.limit ?? 10,
      skip: query.data?.offset ?? 0,
      where: filters,
      include: {
        user: query.data?.['includes[]']?.includes("user") ? {
          select: {
            id: true,
            username: true,
            roles: true,
          }
        } : undefined,
        groups: query.data?.['includes[]']?.includes("scanlation_group") ? {
          include: {
            group: true
          }
        } : undefined
      }
    }),

    await prisma.uploadedChapter.count({
      where: filters
    })])

  const formattedChapters = chapters.map((chapter) => {
    const flattenedGroups: ScanlationGroup[] =
      chapter.groups?.map((g) => g.group!).filter(Boolean) ?? [];

    return formatUploadedChapter({
      ...chapter,
      user: chapter.user
        ? {
          id: chapter.user.id,
          username: chapter.user.username,
          roles: chapter.user.roles,
        } satisfies SafeUser
        : undefined,
      groups: flattenedGroups
    });
  });

  return {
    result: 'ok',
    data: formattedChapters,
    limit: query.data?.limit ?? 10,
    offset: query.data?.offset ?? 0,
    count: total
  };
})