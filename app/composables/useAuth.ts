export interface User {
  id: string
  email: string
  username: string
  role: string
  createdAt: string
  updatedAt: string
}

export const useAuth = () => {
  const session = useState<User | null>('session', () => null)
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

  const logout = async () => {
    await $fetch('/auth/signout', { method: "POST" })
    session.value = null
  }

  return { loggedIn, session, redirect, fetch, refresh, logout }
}