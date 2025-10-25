<script setup lang="ts">
const props = defineProps<{
  group: ScanlationGroup
}>()

const {
  id,
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
} = useScanlationGroup(toRef(props, 'group'))

const durationUnits = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"]

const formattedDelay = computed(() => {
  if (!publishDelay.value) return null

  const duration = parseDuration(publishDelay.value)
  if (!duration) return null

  let result = ''
  for (const unit of durationUnits) {
    const value = duration[unit as keyof typeof duration]
    if (value > 0) {
      result += `${value} ${unit.substring(0, unit.length - 1)}`
      if (value > 1) result += 's'
      result += ' '
    }
  }
  return result.trim()
})

const hasLinks = computed(() => !!website.value || !!ircServer.value || !!ircChannel.value
  || !!discord.value || !!contactEmail.value || !!twitter.value || !!mangaUpdates.value)
</script>
<template>
  <div>
    <div v-if="members.length === 0" class="mb-6">
      <p class="justify-left p-4 px-6 bg-accent">
        This group is unclaimed and has no user set as leader.
        <br><br>
        If this group belongs to you, click <b>Claim Group</b> (...) &gt; <b>Claim Group</b> on mobile and fill out the
        form.
      </p>
    </div>
    <div v-if="hasLinks" class="mb-6">
      <div class="font-bold mb-2">Where to find</div>
      <div class="flex sm:flex-row flex-col gap-2 sm:flex-wrap">
        <UButton v-if="website" icon="i-lucide-globe" variant="outline" color="neutral"
          label="Group Website" :to="website" />
        <UButton v-if="ircServer" icon="i-lucide-hash" variant="outline" color="neutral"
          label="IRC Server" :to="ircServer" target="_blank" rel="noopener noreferrer" />
        <UButton v-if="ircChannel" icon="i-lucide-hash" variant="outline" color="neutral"
          :label="ircChannel" />
        <UButton v-if="discord" variant="outline" color="neutral"
          label="Discord" :to="discord" />
        <UButton v-if="contactEmail" icon="i-lucide-mail" variant="outline" color="neutral"
          label="Email" :to="`mailto:${contactEmail}`" />
        <UButton v-if="twitter" icon="i-lucide-twitter" variant="outline" color="neutral"
          :label="`@${twitter}`":to="`https://x.com/${twitter}`" />
        <UButton v-if="mangaUpdates" variant="outline" color="neutral"
          label="MangaUpdates" :to="mangaUpdates" />
      </div>
    </div>
    <div v-if="description" class="mb-6">
      <div class="font-bold mb-2">Group Description</div>
      <div class="opacity-80 break-all">{{ description }}</div>
    </div>
    <div v-if="leader" class="mb-6">
      <div class="font-bold mb-2">Group Leader</div>
      <UserCard :user="toUser(leader)" showRole />
    </div>
    <div class="flex items-center mb-6">
      <div>
        <div class="font-bold mb-2"> Upload Permissions <!----></div>
        <Tag v-if="inactive && !locked" noWrapper color="warning">
          <span>
            This group has been manually marked as inactive.
            <br>
            Upload restrictions have been lifted.
          </span>
        </Tag>
        <Tag v-else-if="locked" noWrapper color="error">Only group members</Tag>
        <Tag v-else noWrapper color="primary">Anyone</Tag>
      </div>
      <div class="mr-auto ml-auto">
        <div class="font-bold mb-2">Upload delay</div>
        <div class="flex items-center">
          <UIcon name="i-lucide-clock" class="mr-2" />
          <div>{{ formattedDelay || 'None' }}</div>
        </div>
      </div>
      <div v-if="focusedLanguages && focusedLanguages.length > 0" class="mb-6">
        <div class="font-bold mb-2">Group Focused Languages</div>
        <div class="flex sm:flex-row flex-col gap-2 sm:flex-wrap">
          <div v-for="lang in focusedLanguages" :key="lang">
            <LangFlag :lang="lang" />
            {{ LANGUAGES_BY_CODE.get(lang)?.name?.inEnglish }}
          </div>
        </div>
      </div>
    </div>
    <dl class="flex items-center">
      <div>
        <dt class="mb-2 font-bold">Group ID</dt>
        <dd>{{ id }}</dd>
      </div>
      <div class="mr-auto ml-auto">
        <dt class="mb-2 font-bold">Group Members</dt>
        <dd>{{ members.length }}</dd>
      </div>
    </dl>
  </div>
</template>