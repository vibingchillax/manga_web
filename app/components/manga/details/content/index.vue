<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import Covers from './Covers.vue';
import Comments from './Comments.vue';
import Chapters from './Chapters.vue';
import type { Manga } from '~~/shared/types/types';

const props = defineProps<{
  manga: Manga
}>()
const items = ref<TabsItem[]>([
  {
    label: 'Chapters',
    slot: 'chapters',
  },
  {
    label: 'Comments',
    slot: 'comments',
  },
  {
    label: 'Art',
    slot: 'covers',
  },
  {
    label: 'Related',
    slot: 'related',
  }
])
</script>
<template>
  <div class="min-w-0" style="grid-area: content;">
    <u-tabs :items="items" :unmount-on-hide="false">
      <template #chapters="{ item }">
        <Chapters :manga="manga" />
      </template>
      <template #comments="{ item }">
        <Comments :manga="manga" />
      </template>
      <template #covers="{ item }">
        <Covers :manga="manga" />
      </template>
      <template #related="{ item }">

      </template>
    </u-tabs>
  </div>
</template>