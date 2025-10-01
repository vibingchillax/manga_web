export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (user) {
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id
      }
    })
  }

  deleteCookie(event, 'access_token')
  deleteCookie(event, 'refresh_token')

  return 'User signed out successfully'
})
