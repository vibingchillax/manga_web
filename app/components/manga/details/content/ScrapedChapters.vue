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
const title = ref<string>(useMangaTitle(manga));

const selectedSource = ref<SourceLabel>();
const selectedManga = ref<ScrapedManga>();
const scrapedChapters = ref<ScrapedChapter[]>([]);

const loading = ref(false);

const { data, refresh, status } = await useLazyFetch('/api/sources', { immediate: false });

const table = useTemplateRef('table');

const pagination = ref({
  pageIndex: 0,
  pageSize: 100
})

async function selectSource(source: SourceLabel) {
  loading.value = true;
  const temp = scrapedChapters.value;
  try {
    readerStore.setUseProxy(source.flags.includes("needs-referer-header"));
    await readerStore.fetchMangas(title.value, source.id);
    await readerStore.fetchChapters();
    selectedManga.value = readerStore.manga ?? undefined;
    scrapedChapters.value = readerStore.chapters;
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })
    scrapedChapters.value = temp;
  } finally {
    loading.value = false;
  }
}

async function selectManga(manga: ScrapedManga) {
  readerStore.manga = manga;
  selectedManga.value = manga;
  loading.value = true
  title.value = selectedManga.value.title;
  try {
    await readerStore.fetchChapters();
    scrapedChapters.value = readerStore.chapters;
  } catch (error) {
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
  readerStore.setChapter(chapter);
  router.push({ path: `/${chapter.sourceId}/${encodeURIComponent(title.value)}/${chapter.id}` });
}
</script>

<template>
  <div class="flex gap-6 items-start">
    <div class="flex-grow">
      <USelectMenu class="mt-6" placeholder="Select reading source" :loading="status === 'pending'"
        v-model="selectedSource" :items="data" :ui="{ content: 'min-w-fit' }" @update:model-value="selectSource"
        @update:open="() => refresh()">
        <template #item-label="{ item }">
          {{ item.label }}
          <span class="px-4 text-muted">{{ item.url }}</span>
          <span class="px-4 text-muted">{{ item.flags }}</span>
        </template>
      </USelectMenu>
      <USelectMenu v-if="readerStore.mangas.length > 0 && scrapedChapters.length > 0" class="mt-6 mx-4" placeholder="Incorrect match?" v-model="selectedManga" :items="readerStore.mangas"
        :ui="{ content: 'min-w-fit' }" @update:model-value="selectManga">
        <template #item-label="{ item }">
          {{ item.title }}
          <NuxtLink :to="item.url" style="color: yellow">{{ item.url }}</NuxtLink>
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