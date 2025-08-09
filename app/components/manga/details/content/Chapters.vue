<script setup lang="ts">
import { makeSimpleProxyFetcher, makeSources, makeStandardFetcher, targets, type Chapter, type Source, type SourceChaptersOutput } from '@manga_web/sources';
import ChaptersList from './ChaptersList.vue';
import { ref, computed, watch } from 'vue';
import type { Manga, SourceLabel } from '~~/shared/types/types';

function getErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

const toast = useToast();

const props = defineProps<{
  manga: Manga
}>();
const manga = props.manga;

const selectedSourceId = ref<SourceLabel>();
const chapters = ref<Chapter[]>([]);
const loading = ref(false);
const hasFetched = ref(false);
const { data, refresh, status } = await useLazyFetch('/api/sources', { immediate: false });

async function onSelected(source: SourceLabel) {
  hasFetched.value = true;
  loading.value = true;
  try {
    const data = await $fetch<Chapter[]>('/api/chapters', {
      query: {
        mangaTitle: useMangaTitle(manga),
        sourceId: source.id
      }
    });
    chapters.value = data
    console.log('[ChapterScraper]', data);
  } catch (error) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(error),
      color: 'error'
    })
  }
  if (chapters.value.length === 0) {
    toast.add({
      title: 'Nothing found',
      description: 'No chapter found. Please try another source',
      color: 'info'
    })
  }
  loading.value = false;
}
</script>

<template>
  <div class="flex gap-6 items-start">
    <MangaDetailsOtherInfo :manga="manga" />

    <div class="flex-grow">
      <USelectMenu placeholder="Select reading source" :loading="status === 'pending'" v-model="selectedSourceId"
        :items="data" :ui="{ content: 'min-w-fit' }" @update:model-value="onSelected" @update:open="() => refresh()">
        <template #item-label="{ item }">
          {{ item.label }}
          <span class="text-muted">{{ item.url }}</span>
        </template>
      </USelectMenu>

      <UProgress v-if="loading" animation="swing" class="my-6" />
      <ChaptersList v-if="!loading && chapters.length > 0" :chapters="chapters" />
      <div v-else-if="!loading && hasFetched" class="my-6">No chapters found</div>
    </div>
  </div>
</template>
