<script setup lang="ts">
const route = useRoute();
const store = useScrapedReaderStore();
const toast = useToast();

const sourceId = route.params.sourceId as string;
const title = route.params.title as string;
const chapterId = route.params.chapterId as string;

const selectedManga = ref<ScrapedManga | null>(null);

const ready = computed(() => store.mangas.length > 0 && store.manga && store.chapters.length > 0)

if (!store.titleEntry || !ready) {
  try {
    await callOnce(() => store.fetchMangas(title, sourceId));
    selectedManga.value = store.manga;
    await callOnce(store.fetchChapters);
    if (!store.currentChapter) {
      const chapter = store.chapters.find(c => c.id === chapterId);
      if (!chapter) throw new Error(`Can't find chapter with id ${chapterId}`);
      store.setChapter(chapter);
    }
  } catch (err) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : String(err),
      color: 'error'
    })
  }
}
try {
  await store.fetchPages();
} catch (err) {
  toast.add({
    title: 'Error',
    description: err instanceof Error ? err.message : String(err),
    color: 'error'
  })
}
</script>
<template>
  <MangaReader />
</template>