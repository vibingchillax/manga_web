type MangaRequestBody = {
  sourceId: string,
  titleInput: string
}

export default defineEventHandler(async (event) => {
  const body: MangaRequestBody = await readBody(event);
  if (!body.sourceId || !body.titleInput) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: title, sourceId'
    })
  }
  try {
    return sourcesInstance.runSourceForMangas({
      sourceId: body.sourceId,
      titleInput: body.titleInput
    })
  } catch (err) {
    throw createError(err instanceof Error ? err.message : String(err));
  }
})