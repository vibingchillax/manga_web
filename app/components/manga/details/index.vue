<script setup lang="ts">
import type { Manga } from "~~/shared/types";

const props = defineProps<{
  manga: Manga;
}>();
const manga = props.manga;
const { title, altTitles, cover, authorsList } = useManga(manga);

const preferredAltTitle = computed(() => {
  const priority = ["en", "ja", "kr"]; // still not sure what is mangadex's alt title order

  for (const key of priority) {
    const match = altTitles.value?.find((title) => key in title);
    if (match) return match[key];
  }

  const first = altTitles.value?.find((title) => Object.values(title)[0]);
  return first ? Object.values(first)[0] : undefined;
});
</script>

<template>
  <PageSeparator
    :background="cover.url512"
    :is-manga="true"
    :title="title"
    :alt-title="preferredAltTitle"
    :sub-title="authorsList"
  >
    <template #icon>
      <MangaCover :manga="manga" no-title show-flag lightbox :use256="false" />
    </template>
    <template #buttons>
      <MangaDetailsButtons :manga="manga" />
    </template>
    <template #stats>
      <MangaDetailsStats :manga="manga" />
    </template>
    <template #info>
      <MangaDetailsInfo :manga="manga" />
    </template>
    <template #synopsis>
      <MangaDetailsSynopsis :manga="manga" />
    </template>
    <template #content>
      <MangaDetailsContent :manga="manga" />
    </template>
  </PageSeparator>
</template>
