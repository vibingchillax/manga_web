import * as z from 'zod'

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

  const body = z.array(z.string().uuid()).safeParse(await readBody(event))

  if (!body.success) throw createError({
    statusCode: 400,
    statusMessage: 'Invalid request body',
    data: body.error.flatten()
  })

  const data = body.data

  await prisma.uploadSessionFile.deleteMany({
    where: {
      id: { in: data },
      sessionId
    }
  })

  return {
    result: "ok"
  }
})