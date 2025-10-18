<script setup lang="ts">
import type { Manga } from '~~/shared/types';

const props = defineProps<{
  manga: Manga
  dense?: boolean
  coverOnly?: boolean
  overview?: boolean
  noLink?: boolean
  openInNewTab?: boolean
  use256?: boolean
  showFlag?: boolean
}>()

const manga = props.manga
const {
  title,
  detailsUrl,
  description,
  publicationStatus,
  tags,
  contentRating,
  originalLanguage
} = useManga(manga);
</script>
<template>
  <div :class="[
    'manga-card',
    { dense: dense, 'cover-only': coverOnly, overview: overview }
  ]">
    <NuxtLink class="font-bold title" :to="noLink ? undefined : detailsUrl" :target="openInNewTab ? '_blank' : '_self'"
      style="grid-area: title;"> <!-- exactactiveclass?-->
      <LangFlag v-if="showFlag" :lang="originalLanguage ?? 'NULL'" class="mr-1" />
      <span>{{ title }}</span>
    </NuxtLink>
    <span class="author">
    </span>
    <div class="manga-card-cover" style="grid-area: art;">
      <MangaCover class="cover" :manga="manga" :noLink="noLink" :openInNewTab="openInNewTab" fillHeight fixedAspect
        :use256="use256" noTitle />
    </div>
    <div style="grid-area: status;" class="flex flex-wrap status mb-auto"> <!-- breakpoints: sm-->
      <MangaStatus :status="publicationStatus ?? 'ongoing'" />
    </div>
    <TagsRow class="self-start tags" :rows="1"> <!-- sm ? 1 : 2-->
      <!-- <MangaStatus content :status="publicationStatus ?? 'ongoing'" />  breakpoints: sm-->
      <MangaTag v-if="contentRating" :value="contentRating" /> 
      <MangaTag v-for="tag in sortedTags(tags)" :key="tag.id" 
        :value="tag.attributes?.name?.en!"
        :to="noLink ? undefined : routeToTag(tag)"
      />
    </TagsRow>
    <div class="stats" style="grid-area: stats;"></div>
    <div class="description !py-0" style="grid-area: description;">
      <MDC class="md-container dense" v-if="description && description.en" :value="description.en" />
    </div>
  </div>
</template>
<style lang="css" scoped>
.stat {
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: .875rem;
  gap: .25rem;
  line-height: 1.25rem
}

.stats {
  align-items: center;
  display: grid;
  gap: .25rem;
  grid-auto-flow: row;
  grid-template-columns: 1fr 1fr 1fr 1fr
}

.author {
  display: none;
  grid-area: author;
  height: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.author>:not(:last-child):after {
  content: ", "
}

.tags {
  grid-area: tags
}

.manga-card {
  background-color: rgb(var(--mw-accent));
  display: grid;
  flex-grow: 1;
  gap: .25rem .5rem;
  grid-template-areas: "art title title" "art stats status" "art tags tags" "art description description";
  grid-template-columns: min(25%, 150px) 1fr auto;
  grid-template-rows: auto auto auto 1fr;
  padding: .5rem;
  position: relative;
  width: 100%
}

.manga-card,
.manga-card-cover {
  border-radius: .25rem;
  overflow: hidden
}

.manga-card-cover {
  align-self: flex-start;
  max-height: 100%;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}

.description {
  height: 8.4em;
  overflow: hidden;
  position: relative
}

.description:after {
  background: linear-gradient(rgb(var(--mw-background)/0), rgb(var(--mw-accent)));
  bottom: 0;
  content: "";
  display: block;
  height: .9em;
  left: 0;
  position: absolute;
  width: 100%
}

.title>:first-child {
  margin-bottom: -4px;
  margin-top: -4px
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
  height: unset
}

@media (min-width:40rem) {

  .manga-card-dense .manga-card,
  .manga-card.dense {
    grid-template-areas: "art title author stats status" "art tags tags tags tags" "art description description description description";
    grid-template-columns: 84px auto 1fr auto auto
  }
}

.manga-card-dense .manga-card .stats,
.manga-card.dense .stats {
  display: flex
}

.manga-card-dense .manga-card .stat,
.manga-card.dense .stat {
  font-size: .875rem
}

.manga-card-dense .manga-card .author,
.manga-card.dense .author {
  display: none
}

@media (min-width:40rem) {

  .manga-card-dense .manga-card .author,
  .manga-card.dense .author {
    display: block
  }
}

.manga-card-dense .manga-card .title,
.manga-card.dense .title {
  height: 1.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.manga-card-dense .manga-card .description,
.manga-card.dense .description {
  height: auto;
  max-height: 4.95em
}

.manga-card-dense .manga-card .description:after,
.manga-card.dense .description:after {
  height: 1.5em;
  top: 3.45em
}

.manga-card-dense .manga-card.overview,
.manga-card.dense.overview {
  grid-template-areas: "art title" "art author" "art status";
  grid-template-columns: 64px 1fr
}

.manga-card-dense .manga-card.overview .description,
.manga-card-dense .manga-card.overview .stats,
.manga-card-dense .manga-card.overview .tags,
.manga-card.dense.overview .description,
.manga-card.dense.overview .stats,
.manga-card.dense.overview .tags {
  display: none
}

.manga-card-cover-only .manga-card,
.manga-card.cover-only {
  border-radius: .25rem;
  display: block;
  height: unset;
  overflow: hidden;
  padding: 0
}

.manga-card-cover-only .manga-card .description,
.manga-card-cover-only .manga-card .stats,
.manga-card-cover-only .manga-card .status,
.manga-card-cover-only .manga-card .tags,
.manga-card.cover-only .description,
.manga-card.cover-only .stats,
.manga-card.cover-only .status,
.manga-card.cover-only .tags {
  display: none
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
  -webkit-line-clamp: 2
}

@media (min-width:40rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3
  }
}

@media (min-width:48rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4
  }
}

@media (min-width:64rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5
  }
}

.manga-card-cover-only .manga-card .title>span,
.manga-card.cover-only .title>span {
  flex-grow: 1;
  font-size: .875rem;
  font-weight: 400;
  line-height: 1.25rem;
  line-height: 1.25;
  overflow: hidden;
  --tw-text-opacity: 1;
  color: rgb(255 255 255/var(--tw-text-opacity, 1))
}

@media (min-width:40rem) {

  .manga-card-cover-only .manga-card .title,
  .manga-card.cover-only .title {
    font-size: 1rem;
    line-height: 1.375;
    line-height: 1.5rem;
    padding: 1rem .5rem .5rem
  }
}

.manga-card-cover-only .manga-card .title,
.manga-card.cover-only .title {
  transition-duration: 75ms;
  transition-property: padding;
  transition-timing-function: ease-in-out
}

.manga-card-cover-only .manga-card .manga-card-cover,
.manga-card.cover-only .manga-card-cover {
  height: 0;
  padding-bottom: 142.307692%;
  position: relative;
  width: 100%
}

.manga-card-cover-only .manga-card .cover,
.manga-card.cover-only .cover {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%
}

.manga-card-cover-only .manga-card >>>.cover img,
.manga-card.cover-only >>>.cover img {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transition-duration: 75ms;
  transition-property: width, height;
  transition-timing-function: ease-in-out;
  width: 100%
}

@media (hover:hover) {
  .manga-card-cover-only .manga-card:hover .cover img {
    height: 102%;
    width: 102%
  }

  .manga-card-cover-only .manga-card:hover .title {
    padding: 100% .5rem 1rem
  }
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