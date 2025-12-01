<script setup lang="ts">
const route = useRoute();
const { data, pending, error } = await useFetch<SingleResponse<Manga>>(
  `/api/manga/${route.params.mangaId}`,
  {
    query: {
      "includes[]": ["cover_art", "author", "artist"],
    },
    key: `manga-${route.params.mangaId}`,
  },
);
const manga = data.value?.data;
</script>

<template>
  <template v-if="pending"> Loading manga... </template>

  <template v-else-if="error"> Failed to load manga. </template>

  <MangaDetails v-else-if="manga" :manga />
</template>
