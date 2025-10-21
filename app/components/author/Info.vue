<script setup lang="ts">
import type { components } from '#open-fetch-schemas/mangadex';

const props = defineProps<{
  author: components["schemas"]["Author"]
}>()

const socials = computed(() => {
  const links: { href: string, name: string, icon: string }[] = []
  const attrs = props.author.attributes
  SOCIAL_LINKS.forEach(l => {
    if (attrs && attrs[l.apiCode as keyof typeof attrs]) {
      links.push({
        href: attrs[l.apiCode as keyof typeof attrs] as string,
        name: l.name,
        icon: l.icon
      })
    }
  })
  return links
})
</script>
<template>
  <div>
    <div class="font-medium mb-2">Biography</div>

    <MDC v-if="author.attributes?.biography?.en" :value="author.attributes.biography?.en" />
    <div v-else class="italic">No biography</div>

    <div v-if="socials.length > 0" class="my-6">
      <div class="font-medium mb-2">Where to find</div>
      <div class="flex sm:flex-row flex-col gap-2 sm:flex-wrap">
        <Tag v-for="link in socials" :href="link.href">{{ link.name }}</Tag>
      </div>
    </div>
  </div>
</template>