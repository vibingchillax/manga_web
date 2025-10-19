import { getAuthenticatedUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
})
