export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) throw createError({
    statusCode: 401,
    statusMessage: 'Not logged in'
  })

  const session = await prisma.uploadSession.findUnique({
    where: {
      userId: user.id
    }
  })

  if (!session) throw createError({
    statusCode: 404,
    statusMessage: 'No current upload session'
  })

  return session
})