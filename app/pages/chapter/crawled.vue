<script setup lang="ts">
import type { Chapter } from '@manga_web/sources';

const route = useRoute();
const chapter = computed(() => JSON.parse(route.query.chapter as string) as Chapter) //wut da hel bro
// ^^ bad idea
</script>
<template>
  <MangaReader :chapter="chapter" />
</template>