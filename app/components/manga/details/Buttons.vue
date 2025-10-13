<script setup lang="ts">
import type { Manga } from '~~/shared/types';
import AddToLibrary from './AddToLibrary.vue';

const props = defineProps<{
  manga: Manga
}>()
</script>
<template>
  <div class="flex gap-2 sm:mb-0 mb-2 flex-wrap">
    <AddToLibrary :manga="manga" />

    <UButton color="neutral" icon="i-lucide-upload" :to="`/title/upload/${manga.id}`">Upload Chapter</UButton>
  </div>
</template>