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

  const fileId = getRouterParam(event, 'fileId')

  if (!fileId) throw createError({
    statusCode: 400,
    statusMessage: 'No fileId provided'
  })

  await prisma.uploadSessionFile.delete({
    where: {
      id: fileId,
      sessionId: sessionId
    }
  })

  return {
    result: "ok"
  }
})