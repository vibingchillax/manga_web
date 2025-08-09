<script setup lang="ts">
import { useMangaCover } from '~/composables/useMangaCover';
import type { Manga } from '~~/shared/types/types';

const props = defineProps<{ manga: Manga }>();
const manga = props.manga
const mangaTitle = useMangaTitle(manga);
const detailsUrl = `/title/${manga.id}/${toKebabCase(mangaTitle)}`
const coverUrl = useMangaCover(manga).coverUrl256
const publicationStatus = manga.attributes?.status
</script>
<template>
  <NuxtLink class="manga-card-dense" :href="detailsUrl">
    <div class="dense-manga-container">
      <NuxtLink class="group flex items-start relative mb-auto select-none w-full h-full cover" :href="detailsUrl">
        <NuxtImg class="rounded shadow-md w-full h-full" :src="coverUrl" alt="Cover Image"></NuxtImg>
      </NuxtLink>
      <div class="font-bold text-lg line-clamp-1 break-all">{{ mangaTitle }}</div>
      <MangaTag class="lift small dot mr-auto" mode="status" :status="publicationStatus" style="grid-area: status;" />
    </div>
  </NuxtLink>
</template>
<style lang="css" scoped>
.dense-manga-container {
  background: rgb(var(--mw-accent));
  border-radius: .25rem;
  -moz-column-gap: .5rem;
  column-gap: .5rem;
  display: grid;
  grid-template-areas:
    "cover title "
    "cover stats "
    "cover status";
  grid-template-columns: 56px auto;
  padding: .375rem;
  transition: background .1s ease-out;
}

.cover {
  grid-area: cover;
  max-height: 80px;
  min-height: 80px;
}
</style>