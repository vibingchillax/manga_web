import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const params = await getValidatedRouterParams(event, z.object({
    sessionId: zUuid,
    fileId: zUuid
  }).parse)

  await prisma.uploadSessionFile.delete({
    where: {
      id: params.fileId,
      sessionId: params.sessionId
    }
  })

  return {
    result: "ok"
  }
})