export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const sessionId = getRouterParam(event, 'sessionId')

  if (!sessionId) throw createError({
    statusCode: 400,
    statusMessage: 'No sessionId provided'
  })

  const body: string[] = await readBody(event)

  if (!body || body.length === 0) throw createError({
    statusCode: 400,
    statusMessage: 'No file id list given'
  })

  await prisma.uploadSessionFile.deleteMany({
    where: {
      id: { in: body}
    }
  })

  return {
    result: "ok"
  }
})