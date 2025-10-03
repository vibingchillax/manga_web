<script setup lang="ts">
import { type Manga } from '~~/shared/types';
import ChaptersList from './ChaptersList.vue';
import type { ScrapedChapter, ScrapedManga } from '~~/shared/prisma/client';

const toast = useToast();

const props = defineProps<{
  manga: Manga
}>();

const preferences = usePreferencesStore();

const manga = props.manga;
const originalTitle = useManga(manga).title.value as string
const title = ref<string>(originalTitle);

const selectedSource = ref<SourceLabel>();
const scrapedMangas = ref<ScrapedManga[]>([]);
const scrapedChapters = ref<ScrapedChapter[]>([]);
const selectedManga = ref<ScrapedManga>();
const hasFetched = ref(false);

const loading = ref(false);
const progressValue = ref(0);

const { data, status } = await useFetch('/sources');

async function selectSource(source: SourceLabel) {
  loading.value = true;
  try {
    const mangas = await $fetch<ScrapedManga[]>('/scrape/mangas', {
      method: 'POST',
      body: { title: title.value, sourceId: source.id, mangadexId: manga.id }
    });
    if (!mangas || !(mangas.length > 0)) throw new Error('Nothing found');
    scrapedMangas.value = mangas;
    progressValue.value = 1;
    const chapters = await $fetch<ScrapedChapter[]>(`/scraped/manga/${mangas[0]!.id}/feed`);
    if (!chapters || !(chapters.length > 0)) throw new Error('Nothing found');
    scrapedChapters.value = chapters;
    progressValue.value = 2;
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
  selectedManga.value = manga;
  loading.value = true;
  title.value = selectedManga.value.title;
  progressValue.value = 1;
  try {
    const chapters = await $fetch<ScrapedChapter[]>(`/scraped/manga/${manga.id}/feed`);
    if (!chapters || !(chapters.length > 0)) throw new Error('Nothing found');
    scrapedChapters.value = chapters;
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
  const filteredChapters = scrapedChapters.value.filter(ch =>
    preferences.filteredLanguages.length === 0 || preferences.filteredLanguages.includes(ch.translatedLanguage || 'en')
  )
  for (const ch of filteredChapters) {
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
  <div class="flex gap-6 items-start">
    <div class="mt-6">
      <USelectMenu placeholder="Select reading source" :loading="status === 'pending'" v-model="selectedSource"
        :items="data" :ui="{ content: 'min-w-fit' }" @update:model-value="selectSource">
        <template #item-label="{ item }">
          {{ item.label }}
          <span class="px-4 text-muted">{{ item.url }}</span>
          <span class="px-4 text-muted">{{ item.flags }}</span>
        </template>
      </USelectMenu>
      <USelectMenu v-if="hasFetched && scrapedMangas.length > 0 && scrapedChapters.length > 0" class="mx-4"
        placeholder="Incorrect match?" v-model="selectedManga" :items="scrapedMangas" :ui="{ content: 'min-w-fit' }"
        @update:model-value="selectManga">
        <template #item-label="{ item }">
          {{ item.title }}
          <NuxtLink :to="item.url" style="color: yellow">{{ item.url }}</NuxtLink>
        </template>
      </USelectMenu>
    </div>
    <div class="flex-grow">
      <UProgress v-if="loading" v-model="progressValue" :max="['Fetching mangas...', 'Fetching chapters...']" />
      <div v-if="!loading && hasFetched && scrapedChapters.length > 0">
        <ChaptersList v-for="([vol, chapters]) in groupedChapters" :key="vol" :volume="vol" :chapters="chapters" />
      </div>
    </div>
  </div>
</template>