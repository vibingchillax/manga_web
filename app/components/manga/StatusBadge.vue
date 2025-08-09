<script setup lang="ts">
import { computed } from 'vue'
import type { Tag } from '~/shared/types/types';
const props = defineProps<{
  label?: string
  tag?: Tag
  link?: boolean
}>()

const styleMap: Record<string, string> = {
  suggestive: 'bg-status-yellow',
  erotica: 'bg-status-red text-white',
  pornographic: 'bg-status-red text-white',
  'sexual violence': 'bg-status-red text-white',
  gore: 'bg-status-red text-white',
  doujinshi: 'bg-status-purple text-white',
}

const tagName = computed(() => {
  return props.label ?? props.tag?.attributes?.name?.en ?? ''
})

const tagClass = computed(() => {
  return styleMap[tagName.value.toLowerCase()] ?? ''
})
</script>

<template>
  <span v-if="!link || link === undefined || label" class="inline-flex items-center gap-1 rounded uppercase text-[0.625rem] 
    font-bold px-[0.375rem] leading-[1.5em] my-auto" :class="tagClass">
    {{ tagName }}
  </span>
  <NuxtLink v-else :href="`/tag/${tag?.id}/${toKebabCase(tagName)}`" class="inline-flex items-center gap-1 rounded uppercase 
    text-[0.625rem] font-bold px-[0.375rem] leading-[1.5em] my-auto" :class="tagClass">
    {{ tagName }}
  </NuxtLink>
</template>
<style lang="css" scoped>
.bg-status-yellow {
  background-color: rgb(var(--mw-status-yellow));
}

.bg-status-red {
  background-color: rgb(var(--mw-status-red));
}

.bg-status-purple {
  background-color: rgb(var(--mw-status-purple));
}
</style>
