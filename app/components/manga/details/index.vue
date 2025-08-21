<script setup lang="ts">
import { useMangaCover } from '~/composables/useMangaCover';
import type { Manga } from '~~/shared/types/types';

const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const coverUrlOriginal = ""
const coverUrl = useMangaCover(manga).coverUrl512;
</script>

<template>
  <div class="layout-container manga has-gradient px-4">
    <div class="absolute top-0 left-0 z-[-2] w-full h-[640px] blur-xl" :style="{
      background: `radial-gradient(circle at top, rgb(var(--mw-background) / 0.8), 
    rgb(var(--mw-background)) 75%), no-repeat top 35% center / 100% url('${coverUrl}') 
    `}"></div>
    <div class="banner-container block">
      <div class="banner-image" :style="{
        backgroundImage: `url(${coverUrl})`
      }" style="width: 100%;"></div>
      <div class="banner-shade"></div>
    </div>
    <MangaDetailsCover :manga="manga" />
    <MangaDetailsTitle :manga="manga" />
    <MangaDetailsButtons :manga="manga" />
    <MangaDetailsStats :manga="manga" />
    <MangaDetailsInfo :manga="manga" />
    <MangaDetailsSynopsis :manga="manga" />
    <MangaDetailsContent :manga="manga" />
  </div>
</template>
<style lang="css" scoped>
.layout-container.manga {
  --banner-overlay-gradient: linear-gradient(to bottom, rgb(var(--mw-background)/.8) 0%, rgb(var(--mw-background)) 100%);
  gap: .75rem 1rem;
  grid-template-areas: "art title" "art stats" "info info" "buttons buttons" "synopsis synopsis" "content content";
  grid-template-columns: 100px auto
}

@media (min-width:40rem) {
  .layout-container.manga {
    --banner-filter: blur(4px);
    --banner-overlay-gradient: linear-gradient(67.81deg, rgba(0, 0, 0, .64) 35.51%, transparent);
    gap: 1rem;
    grid-template-areas:
      "left art      title    right"
      "left art      buttons  right"
      "left art      info     right"
      "left art      stats    right"
      "left art      padding  right"
      "left synopsis synopsis right"
      "left content  content  right";
    grid-template-columns: 1fr 200px minmax(0, calc(1240px - 3.5rem)) 1fr
  }
}
</style>
