import { getAuthenticatedUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) return {
    isAuthenticated: false,
    user: null
  }
  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
})
