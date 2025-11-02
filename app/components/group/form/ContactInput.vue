<script setup lang="ts">
const model = defineModel<{
  website?: string;
  ircServer?: string;
  ircChannel?: string;
  discord?: string;
  contactEmail?: string;
  twitter?: string;
  mangaUpdates?: string;
}>({ required: true });
</script>
<template>
  <UFormField label="Website" class="mb-2" name="website">
    <UInput
      v-model="model.website"
      size="xl"
      class="w-full"
      icon="i-lucide-globe"
      placeholder="https://example.com"
    />
  </UFormField>
  <UFormField label="IRC Server" class="mb-2" name="ircServer">
    <UInput
      v-model="model.ircServer"
      size="xl"
      class="w-full"
      icon="i-lucide-hash"
      placeholder="irc.example.com"
    />
  </UFormField>
  <UFormField label="IRC Channel" class="mb-2" name="ircChannel">
    <UInput
      v-model="model.ircChannel"
      size="xl"
      class="w-full"
      icon="i-lucide-hash"
      placeholder="#example"
    />
  </UFormField>
  <UFormField label="Discord" class="mb-2" name="discord">
    <UInput
      v-model="model.discord"
      size="xl"
      class="w-full"
      placeholder="https://discord.gg/example"
    />
  </UFormField>
  <UFormField label="Email" class="mb-2" name="contactEmail">
    <UInput
      v-model="model.contactEmail"
      size="xl"
      class="w-full"
      icon="i-lucide-at-sign"
      placeholder="example@example.com"
    />
  </UFormField>
  <UFormField label="X/Twitter" class="mb-2" name="twitter">
    <UInput
      v-model="model.twitter"
      size="xl"
      class="w-full"
      icon="i-lucide-twitter"
      placeholder="@example"
    />
  </UFormField>
  <UFormField label="MangaUpdates" class="mb-2" name="mangaUpdates">
    <UInput
      v-model="model.mangaUpdates"
      size="xl"
      class="w-full"
      icon="i-lucide-book-open"
      placeholder="https://www.mangaupdates.com/groups.html?id=12345"
    />
  </UFormField>
</template>
