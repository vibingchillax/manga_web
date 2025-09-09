<script setup lang="ts">

const router = useRouter();
const history = useReadingHistoryStore();
const items = ref([
  {
    icon: 'i-lucide-list',
    value: 'dense'
  },
  {
    icon: 'i-lucide-rows-2',
    value: 'normal'
  },
]);
const active = ref<'dense' | 'normal'>('dense');

const chapters = ref<ScrapedChapterWithManga[]>([])
const chapterIds = ref<string[]>([])

chapterIds.value = history._readingHistory.map(h => h.chapterId)

const result = await $fetch<ScrapedChapterWithManga[]>('/scraped/chapter', {
  query: {
    'ids[]': chapterIds.value,
    'includes[]': ['manga']
  }
})
chapters.value = result
const mangaMap = new Map()
for (const c of result) {
  const manga = c
  mangaMap.set(c.id, manga)
}

const groupedChapters = computed(() => {
  const uniqueMangaIds = [...new Set(chapters.value.map(c => c.scrapedMangas.mangaDexId))];
  return uniqueMangaIds.map(id => {
    const manga = chapters.value.find(c => c.scrapedMangas.mangaDexId === id)?.scrapedMangas

    const mangaChapters = chapters.value.filter(c => c.scrapedMangas.mangaDexId === id).map(({ scrapedMangas, ...rest }) => rest);
    return { manga, chapters: mangaChapters };
  });
})

</script>
<template>
  <Page title="Reading History" wide>
    <div>
      <div class="relative flex justify-between gap-2 items-center mb-6">
        <div>
        </div>
        <UTabs v-model="active" :items="items" />
      </div>
      <div :start="new Date().toISOString()">
        <MangaFeedContainer v-for="group in groupedChapters" :key="group.manga!.mangaDexId + group.chapters[0]?.id"
          class="mb-4" :chapter-list="group.chapters" :manga="group.manga!" />
      </div>
    </div>
  </Page>
</template>