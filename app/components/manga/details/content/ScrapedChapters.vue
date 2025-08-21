<script setup lang="ts">
import type { TableRow } from '@nuxt/ui';
import { type ScrapedManga, type Manga, type SourceLabel, type ScrapedChapter } from '~~/shared/types/types';
import { getPaginationRowModel } from '@tanstack/vue-table'

const router = useRouter();
const toast = useToast();

const props = defineProps<{
  manga: Manga
}>();

const readerStore = useScrapedReaderStore();

const manga = props.manga;
const title = useMangaTitle(manga);

const selectedSource = ref<SourceLabel>();
const selectedManga = ref<ScrapedManga | null>(null);
const scrapedChapters = ref<ScrapedChapter[]>([]);

const loading = ref(false);

const { data, refresh, status } = await useLazyFetch('/api/sources', { immediate: false });

const table = useTemplateRef('table');

const pagination = ref({
  pageIndex: 0,
  pageSize: 100
})

async function onSelected(source: SourceLabel) {
  loading.value = true;
  try {
    readerStore.setUseProxy(source.flags.includes("needs-referer-header"));
    await readerStore.fetchMangas(title, source.id);
    selectedManga.value = readerStore.manga;
    await readerStore.fetchChapters();
    scrapedChapters.value = readerStore.chapters;
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })
  } finally {
    loading.value = false;
  }
}

async function selectChapter(row: TableRow<ScrapedChapter>) {
  const chapter = row.original;
  readerStore.titleEntry = manga;
  await readerStore.setChapter(chapter);
  router.push({ path: `/${chapter.sourceId}/${title}/${chapter.id}` });
}
</script>

<template>
  <div class="flex gap-6 items-start">
    <div class="flex-grow">
      <USelectMenu class="mt-6" placeholder="Select reading source" :loading="status === 'pending'"
        v-model="selectedSource" :items="data" :ui="{ content: 'min-w-fit' }" @update:model-value="onSelected"
        @update:open="() => refresh()">
        <template #item-label="{ item }">
          {{ item.label }}
          <span class="px-4 text-muted">{{ item.url }}</span>
          <span class="px-4 text-muted">{{ item.flags }}</span>
        </template>
      </USelectMenu>
      <div class="my-6">
        <UProgress v-if="loading" animation="swing" />
        <div v-if="!loading && scrapedChapters.length > 0">
          <UTable ref="table" :data="scrapedChapters" @select="selectChapter" v-model:pagination="pagination"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }" />
          <div class="my-6 flex justify-center">
            <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
              :items-per-page="table?.tableApi.getState().pagination.pageSize"
              :total="table?.tableApi?.getFilteredRowModel().rows.length"
              @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
          </div>
        </div>
        <div v-else-if="!loading">No chapters found</div>
      </div>
    </div>
  </div>
</template>