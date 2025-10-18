<script setup lang="ts">
import type { Manga } from '~~/shared/types';

const props = defineProps<{ manga: Manga }>();
const manga = props.manga
const { title, detailsUrl, cover, publicationStatus } = useManga(manga)
</script>
<template>
  <NuxtLink class="manga-card-dense" :href="detailsUrl">
    <div class="dense-manga-container">
      <MangaCover class="cover" :manga="manga" noTitle fillHeight :use256="true" />
      <div class="font-bold text-lg line-clamp-1 break-all" style="grid-area: title;">
        {{ title }}
      </div>
      <MangaStatus :status="publicationStatus ?? 'ongoing'" small class="mr-auto" 
        style="grid-area: status;"
      />
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