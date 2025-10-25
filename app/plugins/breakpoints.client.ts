export default defineNuxtPlugin(() => {
  const $breakpoints = useAppBreakpoints()
  return { provide: { breakpoints: $breakpoints } }
})