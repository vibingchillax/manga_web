<script setup lang="ts">
import type { TableRow } from '@nuxt/ui';

const toast = useToast();
const router = useRouter();

const store = useScrapedReaderStore();
const loadingIndicator = useLoadingIndicator();

defineProps<{
  open: boolean
}>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): false }>();

const selectorOpen = ref(false);

function close() {
  emit('update:modelValue', false);
}

async function selectManga(row: TableRow<ScrapedManga>) {
  const manga = row.original;
  store.manga = manga;
  const title = manga.title;
  try {
    selectorOpen.value = false;
    loadingIndicator.start();
    await store.fetchChapters();
    loadingIndicator.finish();
    router.push({ params: { title: title, chapterId: store.chapters[store.chapters.length - 1]?.id } })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })
    selectorOpen.value = true;
  }
}
</script>
<template>
  <div class="mw--reader-menu">
    <div class="reader--menu pinned header-hidden" :class="{ open }">
      <div class="flex justify-between -mx-2 -mt-2">
      </div>
      <div class="flex flex-col gap-y-2 mb-2 md:mb-4">
        <div class="flex">
          <Icon name="i-lucide-sticky-note"></Icon>
          {{ store.manga?.title }}
        </div>
        <UModal v-model:open="selectorOpen">
          <UButton label="Incorrect match?"></UButton>
          <template #content>
            <UTable :data="store.mangas" @select="selectManga"></UTable>
          </template>
        </UModal>
        <div class="flex items-center break-words">
          <Icon name="i-lucide-book-open"></Icon>
          Chapter {{ store.currentChapter?.chapterNumber }}
        </div>
      </div>
      <!-- <div class="flex">
        <button class="rounded custom-opacity relative md-btn flex items-center overflow-hidden accent !px-0"
          style="min-height: 3rem; min-width: 2rem;">
        </button>
      </div>
      <div id="chapter-selector">

      </div> -->
      <hr class="border-1 border-accent-20 !my-2 md:!my-4">
      <div class="flex flex-col gap-y-2">
        <div class="font-medium">Uploaded By</div>
        <div class="flex items-center">
          <Icon name="i-lucide-globe"></Icon> {{ store.currentChapter?.sourceId }}
        </div>
        <div class="flex items-center" v-if="store.currentChapter?.scanlationGroup">
          <Icon name="i-lucide-users"></Icon> {{ store.currentChapter.scanlationGroup }}
        </div>
        <div class="flex items-center" v-if="store.currentChapter?.uploader">
          <Icon name="i-lucide-user"></Icon> {{ store.currentChapter.uploader }}
        </div>
      </div>
      <hr class="border-1 border-accent-20 !my-2 md:!my-4">
      <div class="flex flex-col gap-2">

      </div>
    </div>
  </div>
  <div id="reader-menu-attach"></div>
</template>
<style lang="css" scoped>
.mw--reader-menu {
  grid-area: menu;
}

.reader--menu {
  align-self: flex-start;
  background-color: rgb(var(--mw-background));
  border-left: 1px solid rgb(var(--mw-accent));
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: calc(var(--drawer-reader-width)*-1);
  max-height: 100vh;
  max-width: var(--drawer-reader-width);
  min-width: var(--drawer-reader-min-width);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1rem;
  position: fixed;
  right: 0;
  row-gap: .5rem;
  top: 0;
  transition: all .15s ease-in-out;
  width: 100%;
  z-index: 10;
}

@media (min-width: 48rem) {
  .reader--menu {
    box-shadow: none;
    min-width: var(--drawer-reader-width);
    position: sticky;
    right: unset;
    width: unset;
  }
}

.reader--menu.pinned {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 11;
}

.reader--menu.open {
  margin-right: 0;
}

.reader--menu.open.pinned {
  box-shadow: 0 0 30px -5px #0003;
}
</style>