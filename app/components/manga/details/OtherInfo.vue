<script setup lang="ts">
import type { Manga } from '~~/shared/types';
import type { Tag } from '~~/shared/types';
const props = defineProps<{
  manga: Manga
}>()

const manga = props.manga

const { altTitles, publicationDemographic, links, tags, author } = useManga(manga)

const altTitlesList = computed(() => {
  return altTitles.value?.flatMap(obj =>
    Object.entries(obj) // converts { en: "Title" } into [ ["en", "Title"] ]
  ) ?? []
})

const genres: Tag[] = []
const themes: Tag[] = []
const format: Tag[] = []
const content: Tag[] = []

for (const tag of tags.value) {
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
        <Tag v-for="author in author.authors"
          :href="`/author/${author.id}/${toKebabCase(author.attributes?.name!)}`">
          {{ author.attributes?.name }}
        </Tag>
      </div>
    </div>
    <div class="mb-2">
      <div class="font-bold mb-2">Artist</div>
      <div class="flex gap-2 flex-wrap">
        <Tag v-for="artist in author.artists"
          :href="`/author/${artist.id}/${toKebabCase(artist.attributes?.name!)}`">
          {{ artist.attributes?.name }}
        </Tag>
      </div>
    </div>
    <div v-if="genres.length > 0" class="mb-2">
      <div class="font-bold mb-2">Genres</div>
      <div class="flex gap-2 flex-wrap">
        <Tag v-for="tag in genres" :href="`/tag/${tag.id}/${toKebabCase(tag.attributes?.name?.en!)}`">
          {{ tag.attributes?.name?.en }}
        </Tag>
      </div>
    </div>
    <div v-if="publicationDemographic" class="mb-2">
      <div class="font-bold mb-2">Demographic</div>
      <div class="flex gap-2 flex-wrap">
        <Tag :href="`/titles?demos=${publicationDemographic}`">
          {{ publicationDemographic.charAt(0).toUpperCase() + publicationDemographic.slice(1) }}
        </Tag>
      </div>
    </div>
    <div v-if="format.length > 0" class="mb-2">
      <div class="font-bold mb-2">Format</div>
      <div class="flex gap-2 flex-wrap">
        <Tag v-for="tag in format" :href="`/tag/${tag.id}/${toKebabCase(tag.attributes?.name?.en!)}`">
          {{ tag.attributes?.name?.en }}
        </Tag>
      </div>
    </div>
    <div class="mb-2">
      <div class="font-bold mb-2">Read or Buy</div>
      <div class="flex gap-2 flex-wrap">
        <Tag v-if="links?.raw" :href="links?.raw" target="_blank">Official Raw</Tag>
        <Tag v-if="links?.engtl" :href="links?.engtl" target="_blank">Official English</Tag>
        <Tag v-if="links?.amz" :href="links?.amz" target="_blank">Amazon</Tag>
        <Tag v-if="links?.bw" :href="`https://bookwalker.jp/${links?.bw}`" target="_blank">Book☆Walker</Tag>
        <Tag v-if="links?.cdj" :href="links?.cdj" target="_blank">CDJapan</Tag>
        <Tag v-if="links?.ebj" :href="links?.ebj" target="_blank">eBookJapan</Tag>
      </div>
    </div>
    <div class="mb-2" v-if="links?.al || links?.ap || links?.kt || links?.mal || links?.mu || links?.nu">
      <div class="font-bold mb-2">Track</div>
      <div class="flex gap-2 flex-wrap">
        <Tag v-if="links?.al" :href="`https://anilist.co/manga/${links?.al}`" target="_blank">AniList</Tag>
        <Tag v-if="links?.ap" :href="`https://www.anime-planet.com/manga/${links?.ap}`" target="_blank">Anime-Planet</Tag>
        <Tag v-if="links?.kt" :href="`https://kitsu.app/manga/${links?.kt}`" target="_blank">Kitsu</Tag>
        <Tag v-if="links?.mal" :href="`https://myanimelist.net/manga/${links?.mal}`" target="_blank">MyAnimeList</Tag>
        <Tag v-if="links?.mu" :href="`https://www.mangaupdates.com/series/${links?.mu}`" target="_blank">MangaUpdates</Tag>
        <Tag v-if="links?.nu" :href="`https://www.novelupdates.com/series/${links?.nu}`" target="_blank">NovelUpdates</Tag>
      </div>
    </div>

    <div v-if="altTitlesList.length > 0" class="w-full">
      <div class="font-bold mb-1">Alternative Titles</div>
      <div class="mb-1 flex flex-col gap-1 alt-title">
        <div v-for="[lang, title] in altTitlesList" :key="lang" class="flex items-center gap-2">
          <LangFlag :lang="lang" :display-scripts="true"/>
          <span>{{ title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>