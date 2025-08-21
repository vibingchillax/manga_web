import { ScrapedManga } from "~~/shared/types/types";

type ChaptersRequestBody = {
  manga: ScrapedManga
}

export default defineEventHandler(async (event) => {
  const body: ChaptersRequestBody = await readBody(event);
  if (!body.manga) throw createError({
    statusCode: 400,
    statusMessage: 'Missing manga in body'
  })
  try {
    return sourcesInstance.runSourceForChapters({
      manga: body.manga,
    })
  } catch (err) {
    throw createError(err instanceof Error ? err.message : String(err));
  }
})