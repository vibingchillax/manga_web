<script setup lang="ts">
import { MangaDetails } from '#components';

const route = useRoute()
const { manga, pending, error } = useMangaById(route.params.mangaId as string)
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
