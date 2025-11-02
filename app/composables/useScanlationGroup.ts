export const useScanlationGroup = (group: Ref<ScanlationGroup | undefined>) => {
  const id = computed(() => group.value?.id);
  const name = computed(() => group.value?.attributes.name);
  const url = computed(() => `/group/${id.value}/${toKebabCase(name.value)}`);
  const avatar = computed(() => "");

  const members = computed(
    () =>
      group.value?.relationships?.filter(
        (r) => r.type === "member" || r.type === "leader",
      ) ?? [],
  );

  const leader = computed(() => members.value.find((m) => m.type === "leader"));

  const website = computed(() => group.value?.attributes.website);
  const ircServer = computed(() => group.value?.attributes.ircServer);
  const ircChannel = computed(() => group.value?.attributes.ircChannel);
  const discord = computed(() => group.value?.attributes.discord);
  const contactEmail = computed(() => group.value?.attributes.contactEmail);
  const description = computed(() => group.value?.attributes.description);
  const twitter = computed(() => group.value?.attributes.twitter);
  const mangaUpdates = computed(() => group.value?.attributes.mangaUpdates);
  const publishDelay = computed(() => group.value?.attributes.publishDelay);
  const focusedLanguages = computed(
    () => group.value?.attributes.focusedLanguages,
  );

  const locked = computed(() => group.value?.attributes.locked);
  const inactive = computed(() => group.value?.attributes.inactive);

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
    inactive,
  };
};

export const toUser = (
  member: Omit<User, "type"> & { type: "leader" | "member" },
) => {
  const { type, ...rest } = member;
  return {
    type: "user",
    ...rest,
  } as User;
};
