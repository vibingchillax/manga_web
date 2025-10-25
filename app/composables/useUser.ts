export const useUser = (user: Ref<User | undefined>) => {
  const id = computed(() => user.value?.id)
  const username = computed(() => user.value?.attributes.username)
  const roles = computed(() => user.value?.attributes.roles)

  const groups = computed(() => user.value?.relationships?.filter(r => r.type === 'scanlation_group'))

  const pageLink = computed(() => `/user/${id.value}/${toKebabCase(username.value)}`)

  return {
    id,
    username,
    roles,
    groups,
    pageLink
  }
}