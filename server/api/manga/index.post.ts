import { z } from "zod";
import { randomUUID } from "crypto";
import { formatManga } from "~~/server/utils/formatResponse";
import { zExternalSite } from "~~/shared/utils/zodHelper";

export const MangaSchema = z.object({
  title: zLocalizedString,
  altTitles: z.array(zLocalizedString).optional(),
  description: zLocalizedString.optional(),
  authors: zUniqueUuidArray,
  artists: zUniqueUuidArray,
  links: zExternalSite.optional(),
  originalLanguage: zLang,
  lastVolume: zVolume.optional(),
  lastChapter: zChapter.optional(),
  publicationDemographic: zPublicationDemographic,
  status: zMangaStatus,
  year: z.number().int().min(0).optional(),
  contentRating: zContentRating,

  chapterNumberResetOnNewVolume: z.boolean().optional(),
  tags: zUniqueUuidArray.optional(),
  primaryCover: zUuid,
});

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  const body = await readValidatedBody(event, MangaSchema.parse);

  const created = await prisma.manga.create({
    data: {
      id: randomUUID(),
      title: body.title,
      altTitles: body.altTitles,
      description: body.description,
      links: body.links,
      originalLanguage: body.originalLanguage,
      lastVolume: body.lastVolume,
      lastChapter: body.lastChapter,
      publicationDemographic: body.publicationDemographic,
      status: body.status,
      year: body.year,
      contentRating: body.contentRating,
      chapterNumberResetOnNewVolume: body.chapterNumberResetOnNewVolume,

      authors: {
        connect: body.authors.map((id) => ({ id })),
      },
      artists: {
        connect: body.artists.map((id) => ({ id })),
      },
      tags: {
        connect: body.tags?.map((id) => ({ id })),
      },
      primaryCover: {
        connect: { id: body.primaryCover },
      },
    },
  });

  return {
    result: "ok",
    data: formatManga(created),
  };
});
