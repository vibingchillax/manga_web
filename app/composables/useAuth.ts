export interface User {
  id: string
  email: string
  username?: string
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

  const logout = async () => {
    await $fetch('/auth/signout', { method: "POST" })
    session.value = null
  }

  return { loggedIn, session, redirect, fetch, logout }
}