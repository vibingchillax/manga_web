<script setup lang="ts">
const reader = useReaderStore();
const route = useRoute();

definePageMeta({
  key: "reader",
});

onMounted(() => {
  reader.initializeReader(route.params.chapterId as string);
});

onBeforeUnmount(() => {
  if (!route.path.startsWith("/chapter")) {
    useReaderCache().$reset;
    useReaderPageManager().reset();
  }
});
</script>
<template>
  <MangaReader />
</template>
