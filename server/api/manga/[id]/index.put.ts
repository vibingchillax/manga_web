import { z } from "zod";
import { formatManga } from "~~/server/utils/formatResponse";
import { MangaSchema } from "../index.post";
import { UserRole } from "~~/shared/prisma/enums";

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event);

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });

  if (!user.roles.includes(UserRole.admin))
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });

  const params = await getValidatedRouterParams(
    event,
    z.object({
      id: zUuid,
    }).parse,
  );

  const body = await readValidatedBody(event, MangaSchema.parse);

  const updated = await prisma.manga.update({
    where: {
      id: params.id,
    },
    data: {
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
      version: {
        increment: 1,
      },

      authors: {
        set: body.authors.map((id) => ({ id })),
      },
      artists: {
        set: body.artists.map((id) => ({ id })),
      },
      tags: {
        set: body.tags?.map((id) => ({ id })),
      },
      primaryCover: {
        connect: { id: body.primaryCover },
      },
    },
  });

  return {
    result: "ok",
    data: formatManga(updated),
  };
});
