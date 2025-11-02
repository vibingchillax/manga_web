import { z } from "zod"
import { formatManga } from "~~/server/utils/formatResponse"
import { ContentRating, PublicationDemographic } from "~~/shared/prisma/enums"
import { MangaWhereInput } from "~~/shared/prisma/models"

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, baseQuerySchema.extend({
    title: zName.optional(), // zTitle?
    authorOrArtist: zUuid.optional(),
    'authors[]': zArrayable(zUuid).optional(),
    'artists[]': zArrayable(zUuid).optional(),
    year: z.number().optional(),
    'includedTags[]': zArrayable(zUuid).optional(),
    includedTagsMode: z.enum(["AND", "OR"]).optional(),
    'excludedTags[]': zArrayable(zUuid).optional(),
    excludedTagsMode: z.enum(["AND", "OR"]).optional(),
    status: zMangaStatus.optional(),
    'originalLanguage[]': zArrayable(zLang).optional(),
    'excludedOriginalLanguage[]': zArrayable(zLang).optional(),
    'availableTranslatedLanguage[]': zArrayable(zLang).optional(),
    'publicationDemographic[]': zArrayable(zPublicationDemographic).optional(),
    'contentRating[]': zArrayable(zContentRating).optional(),
    createdAtSince: zDateString.optional(),
    updatedAtSince: zDateString.optional(),
    'order[latestUploadedChapter]': zOrderDirection.optional(),
    group: zUuid.optional()
  }).parse)

  const ids = query["ids[]"] as string[] | undefined
  const publicationDemographic = query["publicationDemographic[]"] as PublicationDemographic[] | undefined
  const contentRating = query["contentRating[]"] as ContentRating[] | undefined
  const originalLanguage = query["originalLanguage[]"] as string[] | undefined
  const excludedOriginalLanguage = query["excludedOriginalLanguage[]"] as string[] | undefined
  const authors = query["authors[]"] as string[] | undefined
  const artists = query["artists[]"] as string[] | undefined

  const filters: MangaWhereInput = {}

  if (ids) filters.id = { in: ids }
  if (query.year) filters.year = query.year
  if (query.status) filters.status = query.status
  if (publicationDemographic) filters.publicationDemographic = { in: publicationDemographic }
  if (contentRating) filters.contentRating = { in: contentRating }
  if (originalLanguage) filters.originalLanguage = { in: originalLanguage }
  if (excludedOriginalLanguage) filters.NOT = {
    originalLanguage: {
      in: excludedOriginalLanguage
    }
  }
  if (query.createdAtSince) filters.createdAt = { gte: new Date(query.createdAtSince) }
  if (query.updatedAtSince) filters.createdAt = { gte: new Date(query.updatedAtSince) }
  if (query.authorOrArtist) {
    filters.OR = [
      { authors: { some: { id: query.authorOrArtist } } },
      { artists: { some: { id: query.authorOrArtist } } }
    ]
  }

  const andConditions: MangaWhereInput[] = []

  if (query["authors[]"]) {
    andConditions.push({
      authors: { some: { id: { in: authors } } },
    })
  }

  if (query["artists[]"]) {
    andConditions.push({
      artists: { some: { id: { in: artists } } },
    })
  }

  if (query["includedTags[]"]) {
    andConditions.push({
      tags: {
        [query.includedTagsMode === "AND" ? "every" : "some"]: {
          id: { in: query["includedTags[]"] },
        },
      },
    })
  }

  if (query["excludedTags[]"]) {
    andConditions.push({
      NOT: {
        tags: {
          [query.excludedTagsMode === "AND" ? "every" : "some"]: {
            id: { in: query["excludedTags[]"] },
          },
        },
      },
    })
  }

  if (andConditions.length > 0) filters.AND = andConditions

  const [manga, total] = await Promise.all([
    await prisma.manga.findMany({
      take: query.limit ?? 10,
      skip: query.offset ?? 0,
      where: filters,
      include: {
        authors: query["includes[]"]?.includes("author"),
        artists: query["includes[]"]?.includes("artist"),
        covers: query["includes[]"]?.includes("cover_art")
          ? {
            where: { isMain: true }
          } : false,
        relationsTo: query["includes[]"]?.includes("manga")
          ? {
            include: {
              to: true
            }
          } : true,
        chapters: {
          select: {
            id: true
          },
          orderBy: {
            publishAt: 'desc'
          },
          take: 1
        }
      }
    }),

    await prisma.manga.count({
      where: filters
    })
  ])

  const languages = await prisma.uploadedChapter.groupBy({
    by: ["mangaId", "translatedLanguage"],
    _count: true,
    where: {
      mangaId: { in: manga.map(m => m.id) },
    },
  })

  const langMap = new Map<string, string[]>()
  for (const row of languages) {
    const list = langMap.get(row.mangaId) ?? []
    list.push(row.translatedLanguage)
    langMap.set(row.mangaId, list)
  }

  return {
    result: "ok",
    data: manga.map(m => formatManga(m, m.chapters?.[0].id ?? null, langMap.get(m.id) ?? [])),
    limit: query.limit ?? 10,
    offset: query.offset ?? 0,
    count: total
  }
})