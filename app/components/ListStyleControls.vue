<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const props = defineProps<{
  noArt?: boolean
}>()

const items = computed<TabsItem[]>(() => [
  {
    icon: 'i-lucide-list',
    value: 'dense'
  },
  {
    icon: 'i-lucide-rows-2',
    value: 'normal'
  },
  ...(props.noArt ? [] : [{
    icon: 'i-lucide-grid-2x2',
    value: 'coverOnly'
  }])
])

const listStyle = defineModel<'dense' | 'normal' | 'coverOnly'>()

if (!listStyle.value) {
  listStyle.value = props.noArt ? 'normal' : 'coverOnly'
}
</script>
<template>
  <UTabs v-model="listStyle" :items="items" />
</template>