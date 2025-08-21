<script setup lang="ts">
import { type ScrapedManga, type Manga, type SourceLabel, type ScrapedChapter } from '~~/shared/types/types';
import ChaptersList from './ChaptersList.vue';

const toast = useToast();

const props = defineProps<{
  manga: Manga
}>();

const readerStore = useScrapedReaderStore();

const manga = props.manga;
const title = ref<string>(useMangaTitle(manga));

const selectedSource = ref<SourceLabel>();
const selectedManga = ref<ScrapedManga>();
const hasFetched = ref(false);

readerStore.titleEntry = manga;

const loading = ref(false);
const progressValue = ref(0);

const { data, refresh, status } = await useLazyFetch('/api/sources', { immediate: false });

async function selectSource(source: SourceLabel) {
  loading.value = true;
  try {
    readerStore.setUseProxy(source.flags.includes("needs-referer-header"));
    await readerStore.fetchMangas(title.value, source.id);
    progressValue.value = 1;
    await readerStore.fetchChapters();
    progressValue.value = 2;
    selectedManga.value = readerStore.manga ?? undefined;
    hasFetched.value = true;
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })
  } finally {
    loading.value = false;
    progressValue.value = 0;
  }
}

async function selectManga(manga: ScrapedManga) {
  readerStore.manga = manga;
  selectedManga.value = manga;
  loading.value = true;
  title.value = selectedManga.value.title;
  progressValue.value = 1;
  try {
    await readerStore.fetchChapters();
    progressValue.value = 2;
    hasFetched.value = true;
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })
  } finally {
    loading.value = false;
    progressValue.value = 0;
  }
}

const groupedChapters = computed(() => {
  const groups = new Map<string, ScrapedChapter[]>();
  for (const ch of readerStore.chapters) {
    const vol = ch.volume ?? 'No Volume';
    if (!groups.has(vol)) groups.set(vol, []);
    groups.get(vol)!.push(ch);
  }

  return Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === 'No Volume') return -1;
    if (b === 'No Volume') return 1;

    const na = Number(a);
    const nb = Number(b);
    const aIsNum = !Number.isNaN(na);
    const bIsNum = !Number.isNaN(nb);

    if (aIsNum && bIsNum) return nb - na;   // numeric DESC
    if (aIsNum) return -1;                  // numeric before non-numeric
    if (bIsNum) return 1;

    return a.localeCompare(b);              // fallback string sort
  });
});

</script>

<template>
  <div class="flex gap-6 items-start mt-6">
    <USelectMenu placeholder="Select reading source" :loading="status === 'pending'" v-model="selectedSource"
      :items="data" :ui="{ content: 'min-w-fit' }" @update:model-value="selectSource" @update:open="() => refresh()">
      <template #item-label="{ item }">
        {{ item.label }}
        <span class="px-4 text-muted">{{ item.url }}</span>
        <span class="px-4 text-muted">{{ item.flags }}</span>
      </template>
    </USelectMenu>
    <USelectMenu v-if="hasFetched && readerStore.mangas.length > 0 && readerStore.chapters.length > 0" class="mx-4"
      placeholder="Incorrect match?" v-model="selectedManga" :items="readerStore.mangas" :ui="{ content: 'min-w-fit' }"
      @update:model-value="selectManga">
      <template #item-label="{ item }">
        {{ item.title }}
        <NuxtLink :to="item.url" style="color: yellow">{{ item.url }}</NuxtLink>
      </template>
    </USelectMenu>
    <div class="flex-grow">
      <UProgress v-if="loading" v-model="progressValue"
        :max="['Fetching mangas...', 'Fetching chapters...']" />
      <div v-if="!loading && hasFetched && readerStore.chapters.length > 0">
        <ChaptersList v-for="([vol, chapters]) in groupedChapters" :key="vol" :volume="vol" :chapters="chapters"
          :mangaTitle="title" />
      </div>
    </div>
  </div>
</template>