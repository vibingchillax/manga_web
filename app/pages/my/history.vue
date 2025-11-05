<script setup lang="ts">
const toast = useToast();
const history = useReadingHistoryStore();
const { _readingHistory } = storeToRefs(history);

const active = ref<"dense" | "normal">("dense");

const scrapedChapters = ref<ScrapedChapter[]>([]);

watch(
  _readingHistory,
  async (newHistory) => {
    const chapterIds = newHistory.map((h) => h.chapterId);

    if (chapterIds.length) {
      const result = await $fetch<ScrapedChapter[]>("/api/scraped/chapter", {
        query: {
          "ids[]": chapterIds,
          "includes[]": ["manga"],
        },
      });
      scrapedChapters.value = result;
    }
  },
  { immediate: true, deep: true },
);

const groupedChapters = computed(() => {
  const groups = new Map<
    string,
    { manga: ScrapedManga; chapters: ScrapedChapter[] }
  >();

  for (const chapter of scrapedChapters.value) {
    const mangaRel = chapter.relationships?.find(
      (r): r is ScrapedManga => r.type === "scraped_manga" && "attributes" in r,
    );

    if (!mangaRel?.attributes) continue;

    if (!groups.has(mangaRel.id)) {
      groups.set(mangaRel.id, { manga: mangaRel, chapters: [] });
    }

    groups.get(mangaRel.id)!.chapters.push(chapter);
  }

  return Array.from(groups.values());
});

function clearHistory() {
  history.$reset();
  toast.add({
    title: "History cleared",
    description: "Your reading history has been cleared.",
    color: "success",
  });
}
</script>
<template>
  <Page title="Reading History" wide>
    <div>
      <div class="relative flex justify-between gap-2 items-center mb-6">
        <UButton
          icon="i-lucide-trash"
          label="Clear history"
          color="error"
          variant="outline"
          @click="clearHistory"
        />
        <ListStyleControls v-model="active" no-art />
      </div>
      <div :start="new Date().toISOString()">
        <MangaFeedContainer
          v-for="group in groupedChapters"
          v-if="groupedChapters.length > 0"
          :key="group.manga?.id + group.chapters[0]?.id"
          class="mb-4"
          :chapter-list="group.chapters"
          :manga="group.manga!"
        />
        <div v-else class="text-center text-muted-foreground mt-20">
          Nothing here yet! Start reading something...
        </div>
      </div>
    </div>
  </Page>
</template>
