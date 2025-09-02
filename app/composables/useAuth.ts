export const useAuth = () => {
  const { data: session } = useFetch('/auth/session')

  const logout = async () => {
    await $fetch('/auth/signout', { method: "POST" })
    session.value = undefined
  }
  return { session, logout }
}