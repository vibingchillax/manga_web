<script setup lang="ts">
import type { Manga, Tag } from '~~/shared/types/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const contentRating = manga.attributes?.contentRating
const tags: Tag[] = manga.attributes?.tags!
const publicationYear = manga.attributes?.year
const publicationStatus = manga.attributes?.status
</script>
<template>
  <div class="sm:mx-2" style="grid-area: info;">
    <div class="flex gap-1 flex-wrap items-center">
      <MangaTagsRow :tags="tags" :content-rating="contentRating"></MangaTagsRow>
      <MangaTag class="dot no-wrapper sm:font-bold uppercase" mode="status" :status="publicationStatus" :year="publicationYear">
      </MangaTag>
    </div>
  </div>
</template>