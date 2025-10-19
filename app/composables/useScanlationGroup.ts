export const useScanlationGroup = (group: Ref<ScanlationGroup | undefined>) => {
  const id = computed(() => group.value?.id)
  const name = computed(() => group.value?.name)
  const url = computed(() => `/group/${group.value?.id}/${toKebabCase(group.value?.name)}`)
  const avatar = computed(() => '')
  const members = computed(() => group.value?.members ?? [])
  const leader = computed(() => members.value.find(m => m.groupRole === 'leader'))

  const website = computed(() => group.value?.website)
  const ircServer = computed(() => group.value?.ircServer)
  const ircChannel = computed(() => group.value?.ircChannel)
  const discord = computed(() => group.value?.discord)
  const contactEmail = computed(() => group.value?.contactEmail)
  const description = computed(() => group.value?.description)
  const twitter = computed(() => group.value?.twitter)
  const mangaUpdates = computed(() => group.value?.mangaUpdates)
  const publishDelay = computed(() => group.value?.publishDelay)
  const focusedLanguages = computed(() => group.value?.focusedLanguages)

  const locked = computed(() => group.value?.locked)
  const inactive = computed(() => group.value?.inactive)

  return {
    id,
    name,
    url,
    avatar,
    members,
    leader,
    website,
    ircServer,
    ircChannel,
    discord,
    contactEmail,
    description,
    twitter,
    mangaUpdates,
    publishDelay,
    focusedLanguages,
    locked,
    inactive
  }
}