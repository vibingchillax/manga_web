<script setup lang="ts">
const toast = useToast()
const history = useReadingHistoryStore()

const active = ref<'dense' | 'normal'>('dense');

const chapters = ref<ScrapedChapterWithManga[]>([])

watch(
  () => history._readingHistory,
  async (newHistory) => {
    const chapterIds = newHistory.map(h => h.chapterId)

    if (chapterIds.length > 0) {
      const result = await $fetch<ScrapedChapterWithManga[]>('/api/scraped/chapter', {
        query: {
          'ids[]': chapterIds,
          'includes[]': ['manga']
        }
      })
      chapters.value = result
    } else {
      chapters.value = []
    }
  },
  { immediate: true, deep: true }
)

const groupedChapters = computed(() => {
  const uniqueMangaIds = [...new Set(chapters.value.map(c => c.manga.mangaDexId))]
  return uniqueMangaIds.map(id => {
    const manga = chapters.value.find(c => c.manga.mangaDexId === id)?.manga
    const mangaChapters = chapters.value
      .filter(c => c.manga.mangaDexId === id)
      .map(({ manga, ...rest }) => rest)
    return { manga, chapters: mangaChapters }
  })
})

function clearHistory() {
  history.$reset()
  toast.add({
    title: 'History cleared',
    description: 'Your reading history has been cleared.',
    color: 'success'
  })
}
</script>

<template>
  <Page title="Reading History" wide>
    <div>
      <div class="relative flex justify-between gap-2 items-center mb-6">
        <UButton @click="clearHistory" icon="i-lucide-trash" label="Clear history" color="error" variant="outline" />
        <ListStyleControls noArt v-model="active" />
      </div>
      <div :start="new Date().toISOString()">
        <MangaFeedContainer v-if="groupedChapters.length > 0" v-for="group in groupedChapters"
          :key="group.manga!.mangaDexId + group.chapters[0]?.id" class="mb-4"
          :chapter-list="group.chapters"
          :manga="group.manga!" />
        <div v-else class="text-center text-muted-foreground mt-20">
          Nothing here yet! Start reading something...
        </div>
      </div>
    </div>
  </Page>
</template>