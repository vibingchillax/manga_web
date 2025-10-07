import { UserRole } from "~~/shared/prisma/enums"

export interface Session {
  id: string
  email: string
  username: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

const STAFF_ROLES: UserRole[] = [UserRole.admin]

export const useAuth = () => {
  const session = useState<Session | null>('session', () => null)
  const redirect = useState<string | null>('authRedirect', () => null)
  const loggedIn = computed(() => Boolean(session.value))

  const fetch = async () => {
    session.value = await $fetch('/auth/session', { method: "GET" })
  }

  const refresh = async () => {
    try {
      console.log('Attempting to refresh token')
      await $fetch('/auth/refresh')
      await fetch()
      console.log('Successfully refreshed access token for user')
    } catch (e) {
      console.error('Failed to refresh access token', e)
      await logout()
    }
  }

  const hasRole = (roles: UserRole[]) =>
    computed(() => session.value && roles.includes(session.value.role))

  const isStaff = hasRole(STAFF_ROLES)

  const logout = async () => {
    await $fetch('/auth/signout', { method: "POST" })
    session.value = null
  }

  return { loggedIn, session, redirect, isStaff, fetch, refresh, hasRole, logout }
}