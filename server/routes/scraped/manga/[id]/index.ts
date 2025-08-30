export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const manga = await prisma.scrapedMangas.findUnique({
    where: {
      id
    }
  })

  if (!manga) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Manga not found'
    })
  }

  return manga
})