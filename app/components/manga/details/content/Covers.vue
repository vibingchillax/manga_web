<script setup lang="ts">
import type { Manga } from '~~/shared/types';
const props = defineProps<{
  manga: Manga
}>();
const manga = props.manga;
const locales = ref<string[]>([manga.attributes?.originalLanguage!]);

const { data, pending, error } = await useMangadex('/cover', {
  query: {
    'manga[]': [manga.id as string],
    'locales[]': locales,
    limit: 100
  },
  key: `cover-${manga.id}-${locales.value}`
});
const covers = data.value?.data

const sortedCovers = computed(() => {
  if (!covers) return []
  return [...covers].sort((a, b) => {
    const volA = Number(a.attributes?.volume) || 99999
    const volB = Number(b.attributes?.volume) || 99999
    return volA - volB
  })
})

const coverUrlBase = `https://uploads.mangadex.org/covers/${manga.id}/`
</script>
<template>
  <div class="font-bold mb-6">Covers</div>
  <div class="">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
      <MangaCover
        v-for="cover in sortedCovers"
        :src="coverUrlBase + cover.attributes?.fileName + '.512.jpg'"
        :label="cover.attributes?.volume ? `Volume ${cover.attributes?.volume}` : 'No volume'"
        :noTitle="false"
        lightbox
      />
    </div>
  </div>
</template>