export default defineNuxtPlugin(async () => {
  const auth = useAuth()
  await auth.refresh()
  setInterval(() => {
    auth.refresh()
  }, 55 * 60 * 1000)
})