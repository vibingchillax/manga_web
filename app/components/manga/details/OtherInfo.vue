<script setup lang="ts">
import { useMangaAuthor } from '~/composables/useMangaAuthor';
import type { Manga } from '~/shared/types/types';
import type { Tag } from '~/shared/types/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const altTitles = manga.attributes?.altTitles
const altTitlesList = computed(() => {
  return altTitles?.flatMap(obj =>
    Object.entries(obj) // converts { en: "Title" } into [ ["en", "Title"] ]
  ) ?? []
})

const demographic = manga.attributes?.publicationDemographic
const links = manga.attributes?.links
const tags = manga.attributes?.tags

const { authors, artists } = useMangaAuthor(manga);

const genres: Tag[] = []
const themes: Tag[] = []
const format: Tag[] = []
const content: Tag[] = []

for (const tag of tags!) {
  const group = tag.attributes?.group
  if (!group) continue

  if (group === 'genre') genres.push(tag)
  else if (group === 'theme') themes.push(tag)
  else if (group === 'format') format.push(tag)
  else if (group === 'content') content.push(tag)
}

</script>
<template>
  <div :id="manga.id" class="flex flex-wrap gap-x-4 gap-y-2" style="flex-basis: 30%; max-width: 400px; min-width: 25%;">
    <div class="mb-2">
      <div class="font-bold mb-2">Author</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink v-for="author in authors" class="tag"
          :href="`/author/${author.id}/${toKebabCase(author.attributes?.name!)}`">
          {{ author.attributes?.name }}
        </NuxtLink>
      </div>
    </div>
    <div class="mb-2">
      <div class="font-bold mb-2">Artist</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink v-for="artist in artists" class="tag"
          :href="`/author/${artist.id}/${toKebabCase(artist.attributes?.name!)}`">
          {{ artist.attributes?.name }}
        </NuxtLink>
      </div>
    </div>
    <div v-if="genres" class="mb-2">
      <div class="font-bold mb-2">Genres</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink v-for="tag in genres" class="tag" :href="`/tag/${tag.id}/${toKebabCase(tag.attributes?.name?.en!)}`">
          {{ tag.attributes?.name?.en }}
        </NuxtLink>
      </div>
    </div>
    <div v-if="demographic" class="mb-2">
      <div class="font-bold mb-2">Demographic</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink class="tag">
          {{ demographic }}
        </NuxtLink>
      </div>
    </div>
    <div v-if="format" class="mb-2">
      <div class="font-bold mb-2">Format</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink v-for="tag in format" class="tag" :href="`/tag/${tag.id}/${toKebabCase(tag.attributes?.name?.en!)}`">
          {{ tag.attributes?.name?.en }}
        </NuxtLink>
      </div>
    </div>
    <div class="mb-2">
      <div class="font-bold mb-2">Read or Buy</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink v-if="links?.raw" :href="links?.raw" class="tag" target="_blank">Official Raw</NuxtLink>
        <NuxtLink v-if="links?.engtl" :href="links?.engtl" class="tag" target="_blank">Official English</NuxtLink>
        <NuxtLink v-if="links?.amz" :href="links?.amz" class="tag" target="_blank">Amazon</NuxtLink>
        <NuxtLink v-if="links?.bw" :href="`https://bookwalker.jp/${links?.bw}`" class="tag" target="_blank">Book☆Walker</NuxtLink>
        <NuxtLink v-if="links?.ebj" :href="links?.ebj" class="tag" target="_blank">eBookJapan</NuxtLink>
      </div>
    </div>
    <div class="mb-2">
      <div class="font-bold mb-2">Track</div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink v-if="links?.al" :href="`https://anilist.co/manga/${links?.al}`" class="tag" target="_blank">AniList</NuxtLink>
        <NuxtLink v-if="links?.ap" :href="`https://www.anime-planet.com/manga/${links?.ap}`" class="tag" target="_blank">Anime-Planet</NuxtLink>
        <NuxtLink v-if="links?.kt" :href="`https://kitsu.app/manga/${links?.kt}`" class="tag" target="_blank">Kitsu</NuxtLink>
        <NuxtLink v-if="links?.mal" :href="`https://myanimelist.net/manga/${links?.mal}`" class="tag" target="_blank">MyAnimeList</NuxtLink>
        <NuxtLink v-if="links?.mu" :href="`https://www.mangaupdates.com/series/${links?.mu}`" class="tag" target="_blank">MangaUpdates</NuxtLink>
        <NuxtLink v-if="links?.nu" :href="`https://www.novelupdates.com/series/${links?.nu}`" class="tag" target="_blank">NovelUpdates</NuxtLink>
      </div>
    </div>

    <div v-if="altTitlesList.length > 0" class="w-full">
      <div class="font-bold mb-1">Alternative Titles</div>
      <div class="mb-1 flex flex-col gap-1 alt-title">
        <div v-for="[lang, title] in altTitlesList" :key="lang" class="flex items-center gap-2">
          <!-- <img :src="`://mangadex.org/img/flags/${lang}.svg`" :alt="`${lang} flag icon`" :title="lang.toUpperCase()" width="24"
            height="24" class="select-none" /> -->
          <span>{{ title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>