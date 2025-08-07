<script setup lang="ts">
import type { Manga } from '~/shared/types/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const contentRating = manga.attributes?.contentRating
const tags = manga.attributes?.tags
const publicationYear = manga.attributes?.year
const publicationStatus = manga.attributes?.status
</script>
<template>
  <div class="sm:mx-2" style="grid-area: info;">
    <div class="flex gap-1 flex-wrap items-center">
      <div class="flex flex-wrap gap-1 tags-row" style="max-height: calc(1em = 0rem);">
        <MangaStatusBadge v-if="contentRating !== 'safe'" :label="contentRating" />
        <MangaStatusBadge v-for="(tag, index) in tags" :key="index" :tag="tag" :link="true" />
      </div>
      <span class="tag dot no-wrapper sm:font-bold uppercase">
        <span>
          <UChip v-if="publicationStatus === 'ongoing'" standalone inset />
          <UChip v-else-if="publicationStatus === 'completed'" color="secondary" standalone inset />
          <UChip v-else-if="publicationStatus === 'hiatus'" color="warning" standalone inset />
          <UChip v-else color="error" standalone inset />
          Publication: {{ publicationYear }}, {{ publicationStatus }}
        </span>
      </span>
    </div>
  </div>
</template>