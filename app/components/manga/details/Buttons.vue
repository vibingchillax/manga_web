<script setup lang="ts">
import type { Manga } from '~~/shared/types';
import AddToLibrary from './AddToLibrary.vue';

const props = defineProps<{
  manga: Manga
}>()
</script>
<template>
  <div class="sm:ml-2 relative" style="grid-area: buttons;">
    <div class="flex gap-2 sm:mb-0 mb-2 flex-w  rap">
      <AddToLibrary :manga="manga" />

      <UButton color="neutral" icon="i-lucide-upload" :to="`/title/upload/${manga.id}`">Upload Chapter</UButton>
    </div>
  </div>
</template>