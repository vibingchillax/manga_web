<script setup lang="ts">
import { makeSimpleProxyFetcher, makeSources, makeStandardFetcher, targets, type Source, type SourceChaptersOutput } from '@manga_web/sources';
import ChaptersList from './ChaptersList.vue';
import { ref, computed, watch } from 'vue';
import type { Manga } from '~/shared/types/types';

const proxyBase = useProxy().proxyUrl;
const fetcher = makeStandardFetcher(fetch);
const proxiedFetcher = makeSimpleProxyFetcher(proxyBase, fetch);

const sourcesInstance = makeSources({
  fetcher,
  proxiedFetcher,
  target: targets.BROWSER,
});

const availableSources = sourcesInstance.listSources() as Source[];

const props = defineProps<{
  manga: Manga
}>();

type SourceLabel = { label: string, id: string, url: string };

const sourcesList = ref<SourceLabel[]>(
  availableSources.map(source => ({
    label: source.name,
    id: source.id,
    url: source.url
  }))
);

const selectedSourceId = ref<string>('readmanga');
const chapters = ref<SourceChaptersOutput>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const selectedSource = computed(() =>
  sourcesList.value.find(s => s.id === selectedSourceId.value) ?? sourcesList.value[0]!
);

async function loadChaptersForSource(source: SourceLabel) {
  if (!source) {
    chapters.value = [];
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result = await sourcesInstance.runSourceForChapters({
      id: source.id,
      manga: {
        id: props.manga.id!,
        title: props.manga.attributes?.title?.en!,
        title_english: props.manga.attributes?.altTitles?.find(t => t.lang === 'en')?.title,
        title_japanese: props.manga.attributes?.altTitles?.find(t => t.lang === 'ja')?.title,
      }
    });
    chapters.value = result;
  } catch (e) {
    console.error('Failed to load chapters:', e);
    error.value = 'Failed to load chapters.';
    chapters.value = [];
  } finally {
    loading.value = false;
  }
}

watch(selectedSource, (source) => {
  loadChaptersForSource(source);
}, { immediate: true });
</script>

<template>
  <div class="flex gap-6 items-start">
    <MangaDetailsOtherInfo :manga="manga" />

    <div class="flex-grow">
      <USelectMenu
        v-model="selectedSourceId"
        value-key="id"
        :items="sourcesList"
        :ui="{ content: 'min-w-fit' }"
      >
        <template #item-label="{ item }">
          {{ item.label }}
          <span class="text-muted">{{ item.url }}</span>
        </template>
      </USelectMenu>

      <div v-if="loading" class="my-4 text-muted">Loading chapters...</div>
      <div v-if="error" class="my-4 text-danger">{{ error }}</div>
      <ChaptersList v-if="!loading && !error" :chapters="chapters" />
    </div>
  </div>
</template>
