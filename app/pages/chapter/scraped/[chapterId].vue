<script setup lang="ts">
const route = useRoute();

const chapterId = route.params.chapterId as string;
const reader = useReaderStore();
reader.initializeReader(chapterId);
</script>
<template>
  <MangaReader />
</template>