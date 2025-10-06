import * as z from 'zod'

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const manga = await prisma.scrapedManga.findUnique({
    where: {
      id: params.id
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