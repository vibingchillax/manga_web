<script setup lang="ts">
import { ProgressSideEnum } from '~/stores/useReaderMenu';

const root = ref<HTMLElement | null>(null);
const readerChapter = ref<HTMLElement | null>(null);
const pageContainer = ref<HTMLElement | null>(null);
const contentWarningVisible = ref(false);

const readerStore = useReaderStore();
const menuStore = useReaderMenu();
const pageManager = useReaderPageManager();

const {
  currentChapter,
  chapterLoadError,
  chapterMeta,
  currentPageNumber,
  immersive,
  manga,
  showContentWarning,
  chapterState,
  immersionBreak
} = storeToRefs(readerStore);

const {
  menuOpen,
  progressSide,
  viewStyle,
  readStyle,
  turnPages,
  turnPagesByScrolling
} = storeToRefs(menuStore);

const is404 = computed(() => !!chapterLoadError && chapterLoadError.value?.status === 404 && useReaderPageManager().pageState === 'error404');
const pageTitle = computed(() => {
  if (is404.value || chapterLoadError) return '';
  if (chapterState.value !== 'loaded') return `Loading...`;
  const chapterLabel = chapterMeta.value.chapterNo ? `Ch. ${chapterMeta.value.chapterNo}` : 'Oneshot';
  return `${currentPageNumber} | ${chapterLabel} - ${chapterMeta.value.mangaTitle}`;
});

const router = useRouter()
const settings = useReaderMenu()

defineShortcuts({
  arrowleft: () => {
    readerStore.incrementPageGroup(-1, router)
  },
  arrowright: () => {
    readerStore.incrementPageGroup(1, router)
  },
  m: () => {
    menuOpen.value = !menuOpen.value
  },
})

watch([currentChapter, currentPageNumber], () => {
  document.title = pageTitle.value;
});
</script>
<template>
  <div ref="root" class="mw--reader-wrap">
    <div v-if="showContentWarning && contentWarningVisible" class="mw--reader-warning">
      <h2>Content Warning</h2>
      <p>{{ manga?.title }} - Chapter contains filtered out content</p>
      <button @click="router.back()">Back</button>
      <button @click="contentWarningVisible = false">OK</button>
    </div>

    <div v-else-if="is404" class="mw--reader-error">
      Chapter not found
    </div>
    <div v-else class="mw--reader-chapter" :class="[
      settings.progressSide === ProgressSideEnum.Left ? 'left-progress' : '',
      settings.progressSide === ProgressSideEnum.Right ? 'right-progress' : '',
    ]">
      <MangaReaderHeader />
      <!-- <MangaReaderOverlay /> -->
      <MangaReaderPages />
      <MangaReaderProgressBar />
    </div>
    <MangaReaderMenu />
  </div>
</template>
<style lang="css" scoped>
.mw--reader-wrap {
  display: grid;
  grid-template-areas:
    "chapter comments menu";
  grid-template-columns: auto min-content min-content;
  height: 100%;
  margin: 0 !important;
  min-height: 100vh;
  overflow-x: clip;
  padding: 0 !important;
  width: 100%;
  --header-padding: 0px;
}

.mw--reader-chapter {
  display: grid;
  grid-template-rows: min-content auto min-content min-content;
  height: 100%;
}

.mw--reader-chapter {
  grid-template-areas:
    "header  "
    "pages   "
    "progress"
    "next    ";
}

.mw--reader-chapter.left-progress {
  grid-template-areas: "header header" "progress pages" "next next";
  grid-template-columns: 0 auto;
  grid-template-rows: min-content auto min-content
}

.mw--reader-chapter.right-progress {
  grid-template-areas: "header header" "pages progress" "next next";
  grid-template-columns: auto 0;
  grid-template-rows: min-content auto min-content
}
</style>