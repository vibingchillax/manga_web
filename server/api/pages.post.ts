type PagesRequestBody = {
  chapter: ScrapedChapter
}

export default defineEventHandler(async (event) => {
  const body: PagesRequestBody = await readBody(event);
  if (!body.chapter) throw createError({
    statusCode: 400,
    statusMessage: 'Missing chapter in body'
  })
  try {
    return sourcesInstance.runSourceForPages({
      chapter: body.chapter
    })
  } catch (err) {
    throw createError(err instanceof Error ? err.message : String(err));
  }
})