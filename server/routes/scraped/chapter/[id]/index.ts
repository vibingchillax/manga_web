export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const param = getQuery(event)

  const includes = Array.isArray(param['includes[]']) ? param['includes[]'] : param['includes[]'] ? [param['includes[]']] : []

  const chapter = await prisma.scrapedChapter.findUnique({
    where: {
      id
    },
    include: {
      manga: includes.includes('manga')
    }
  })

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found'
    })
  }

  return chapter;
})