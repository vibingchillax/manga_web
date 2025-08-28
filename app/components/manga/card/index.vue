<script setup lang="ts">
import { useMangaAuthor } from '~/composables/useMangaAuthor';
import { useMangaCover } from '~/composables/useMangaCover';
import type { Manga } from '~~/shared/types';

const props = defineProps<{
  manga: Manga,
  type: 'normal' | 'dense' | 'coverOnly'
  use512?: boolean
}>()
const manga = props.manga
const title = useMangaTitle(manga);
const detailsUrl = `/title/${manga.id}/${toKebabCase(title)}`
const { coverUrl256, coverUrl512 } = useMangaCover(manga);
// const { authors, artists, samePeople } = useMangaAuthor(manga);
const publicationStatus = manga.attributes?.status
const contentRating = manga.attributes?.contentRating
const tags = manga.attributes?.tags!
</script>

<template>
  <div class="manga-card" :class="{
    'dense': type === 'dense',
    'cover-only': type === 'coverOnly'
  }">
    <NuxtLink class="font-bold title" :href="detailsUrl" style="grid-area: title;">
      <span>{{ title }}</span>
    </NuxtLink>
    <span class="author">
    </span>
    <div class="manga-card-cover" style="grid-area: art;">
      <NuxtLink class="group flex items-start relative mb-auto select-none aspect cover" :href="detailsUrl">
        <NuxtImg class="rounded shadow-md w-full h-auto" :src="use512 ? coverUrl512 : coverUrl256"></NuxtImg>
      </NuxtLink>
    </div>
    <div style="grid-area: status;" class="flex flex-wrap status mb-auto">
      <MangaTag class="lift dot" mode="status" :status="publicationStatus" />
    </div>
    <MangaTagsRow class="tags" :tags="tags" :contentRating="contentRating"></MangaTagsRow>
    <div class="stats" style="grid-area: stats;"></div>
    <div class="description !py-0" style="grid-area: description;">
      <div class="md-container dense">
        <p>
          {{ manga.attributes?.description?.en }}
        </p>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.manga-card {
  background-color: rgb(var(--mw-accent));
  display: grid;
  flex-grow: 1;
  gap: .25rem .5rem;
  grid-template-areas:
    "art title       title      "
    "art stats       status     "
    "art tags        tags       "
    "art description description";
  grid-template-columns: min(25%, 150px) 1fr auto;
  grid-template-rows: auto auto auto 1fr;
  padding: .5rem;
  position: relative;
  width: 100%;
}

.manga-card,
.manga-card-cover {
  border-radius: .25rem;
  overflow: hidden;
}

.manga-card-dense .manga-card,
.manga-card.dense {
  grid-template-areas:
    "art         title       title      "
    "art         stats       stats      "
    "art         tags        tags       "
    "description description description";
  grid-template-columns: 64px 1fr auto;
  grid-template-rows: auto auto 1fr;
  height: unset;
}

@media (min-width: 40rem) {

  .manga-card-dense .manga-card,
  .manga-card.dense {
    grid-template-areas:
      "art title       author      stats       status     "
      "art tags        tags        tags        tags       "
      "art description description description description";
    grid-template-columns: 84px auto 1fr auto auto;
  }
}

.manga-card-cover-only .manga-card .title,
.manga-card.cover-only .title {
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, .8));
  bottom: 0;
  display: -webkit-box;
  left: 0;
  margin-right: 0 !important;
  overflow: hidden;
  padding: 1rem .5rem .25rem;
  position: absolute;
  text-shadow: 0 0 3px #000;
  width: 100%;
  z-index: 1;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (min-width: 40rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}

@media (min-width: 48rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
  }
}

@media (min-width: 64rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
  }
}

@media (min-width: 40rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    font-size: 1rem;
    line-height: 1.375;
    line-height: 1.5rem;
    padding: 1rem .5rem .5rem;
  }
}



.manga-card-dense .manga-card .title,
.manga-card.dense .title {
  height: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manga-card-cover-only .manga-card,
.manga-card.cover-only {
  border-radius: .25rem;
  display: block;
  height: unset;
  overflow: hidden;
  padding: 0;
}

.manga-card-cover-only .manga-card .description,
.manga-card-cover-only .manga-card .stats,
.manga-card-cover-only .manga-card .status,
.manga-card-cover-only .manga-card .tags,
.manga-card.cover-only .description,
.manga-card.cover-only .stats,
.manga-card.cover-only .status,
.manga-card.cover-only .tags {
  display: none;
}

@media (min-width: 40rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    font-size: 1rem;
    line-height: 1.375;
    line-height: 1.5rem;
    padding: 1rem .5rem .5rem;
  }
}

.manga-card-cover-only .manga-card .manga-card-cover,
.manga-card.cover-only .manga-card-cover {
  height: 0;
  padding-bottom: 142.307692%;
  position: relative;
  width: 100%;
}

.author {
  display: none;
  grid-area: author;
  height: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.manga-card-dense .manga-card .author,
.manga-card.dense .author {
  display: none;
}

@media (min-width: 40rem) {

  .manga-card-dense .manga-card .author,
  .manga-card.dense .author {
    display: block;
  }
}

.manga-card-cover {
  align-self: flex-start;
  max-height: 100%;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.tags {
  grid-area: tags;
}

.description {
  height: 8.4em;
  overflow: hidden;
  position: relative;
}

.manga-card-dense .manga-card .description,
.manga-card.dense .description {
  height: auto;
  max-height: 4.95em;
}

.md-container,
.md-container * {
  all: revert;
  font-size: revert;
  line-height: revert;
}

.md-container.dense {
  font-size: .875rem;
  line-height: 1.25rem;
}

.md-container> :first-child {
  margin-top: 0;
}

.md-container> :last-child {
  margin-bottom: 0;
}
</style>