export default defineEventHandler((event) => {
  const query = getQuery(event);
  const mangaTitle = query.mangaTitle
  const sourceId = query.sourceId
  if (!query || !query.mangaTitle || !query.sourceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: mangaTitle, sourceId'
    })
  } 
  return sourcesInstance.runSourceForChapters({
    id: sourceId as string,
    manga: {
      title: mangaTitle as string
    }
  })
})