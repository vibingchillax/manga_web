export default defineEventHandler(async (event) => {
  setCookie(event, 'access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })

  return 'User signed out successfully'
})
