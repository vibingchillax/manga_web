<script setup lang="ts">

const route = useRoute()
const { data, pending, error } = await useMangadex('/manga/{id}', {
  path: {
    id: route.params.mangaId as string
  },
  query: {
    "includes[]": ['cover_art', 'author', 'artist']
  },
  key: `manga-${route.params.mangaId}`
})
const manga = data.value?.data
</script>

<template>
    <template v-if="pending">
      Loading manga...
    </template>

    <template v-else-if="error">
      Failed to load manga.
    </template>

    <MangaDetails :manga v-else-if="manga"/>
</template>
