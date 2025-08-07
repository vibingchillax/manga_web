<script setup lang="ts">
import { useMangaCover } from '~/composables/relationships/useMangaCover';
import type { Manga } from '~/shared/types/types';

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
.layout-container {
    display: grid;
    position: relative;
  --banner-overlap: calc(var(--navbar-height) + var(--top-margin));
  --banner-top: calc(var(--banner-overlap)*-1);
}

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

.banner-container {
    clip: rect(0, auto, auto, 0);
    clip-path: inset(0 0);
    left: 0;
    position: absolute;
    right: 0;
    top: var(--banner-top);
    width: auto;
    z-index: -1
}

.banner-container {
  height: calc(var(--banner-height) + var(--banner-overlap))
}

.banner-container>.banner-shade {
    -webkit-backdrop-filter: var(--banner-filter);
    backdrop-filter: var(--banner-filter);
    background: var(--banner-overlay-gradient);
    bottom: 0;
    height: auto;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    width: auto
}

.banner-image {
    background-position: center 25%;
    background-size: cover;
    position: fixed;
    transition: width .15s ease-in-out;
    width: 100%
}

.banner-image {
  height: calc(var(--banner-height) + var(--banner-overlap));
}
</style>
