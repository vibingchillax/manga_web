<script setup lang="ts">
import Settings from './Settings.vue';

const store = useScrapedReaderStore();
const settings = useReaderSettingsStore();
const router = useRouter();
const overlay = useOverlay();
const menuOpen = ref(false);

const settingsModal = overlay.create(Settings);

function navigate(direction: "prev" | "next") {
  if (direction === "next") {
    if (store.goToNextPage()) return;
    if (!settings.autoAdvance) return;
    if (store.nextChapter) {
      store.goToNextChapter();
    } else if (store.titleEntry) {
      return router.push(`/title/${store.titleEntry.id}/${toKebabCase(useMangaTitle(store.titleEntry))}`);
    }
  }

  if (direction === "prev") {
    if (store.goToPrevPage()) return;
    if (!settings.autoAdvance) return;
    if (store.previousChapter) {
      store.goToPrevChapter();
    } else if (store.titleEntry) {
      return router.push(`/title/${store.titleEntry.id}/${toKebabCase(useMangaTitle(store.titleEntry))}`);
    }
  }
  return router.push({ params: { chapterId: store.currentChapter?.id } })
}

defineShortcuts({
  arrowleft: () => {
    navigate("prev")
  },
  arrowright: () => {
    navigate("next")
  },
  m: () => {
    menuOpen.value = !menuOpen.value;
  },
  i: () => {
    const fits: ReaderSettings["imageFit"][] = ["fitWidth", "fitHeight", "fitBoth", "noLimit"];
    const currentIndex = fits.indexOf(settings.imageFit);
    const nextIndex = (currentIndex + 1) % fits.length;
    settings.setImageFit(fits[nextIndex]!);
  },
  g: () => {
    settingsModal.open()
  }
})
</script>
<template v-if="store.currentChapter">
  <div class="mw--reader-wrap">
    <div class="mw--reader-chapter" :class="[
      settings.progressBarPosition === 'left' ? 'left-progress' : '',
      settings.progressBarPosition === 'right' ? 'right-progress' : '',
    ]">
      <MangaReaderHeader @toggle-menu="menuOpen = !menuOpen" />
      <MangaReaderContent />
      <MangaReaderProgressBar />
    </div>
    <MangaReaderMenu :open="menuOpen" />
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