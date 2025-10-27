<script setup lang="ts">
import type { MangaReaderPages } from '#components';
import { HeaderStyleEnum, ProgressSideEnum, ReadStyleEnum, TurnPagesEnum } from '~/stores/useReaderMenu';

const root = ref<HTMLElement | null>(null);
const readerChapter = ref<HTMLElement | null>(null);
const pageContainer = ref<InstanceType<typeof MangaReaderPages> | null>(null);

const hasInteracted = ref(false);
const contentWarningVisible = ref(false);

const reader = useReaderStore();
const settings = useReaderMenu();
const pageManager = useReaderPageManager();

const { $breakpoints } = useNuxtApp()
const { isFullscreen, enter, exit } = useFullscreen()

const route = useRoute()
const router = useRouter()

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
} = storeToRefs(reader);

const {
  menuOpen,
  menuPinned,
  immersiveTap,
  progressSide,
  viewStyle,
  headerStyle,
  readStyle,
  turnPages,
  turnPagesByScrolling,
  offsetDoubles
} = storeToRefs(settings);

const is404 = computed(() => !!chapterLoadError && chapterLoadError.value?.status === 404 && useReaderPageManager().pageState === 'error404');
const pageTitle = computed(() => {
  if (is404.value || chapterLoadError) return '';
  if (chapterState.value !== 'loaded') return `Loading...`;
  const chapterLabel = chapterMeta.value.chapterNo ? `Ch. ${chapterMeta.value.chapterNo}` : 'Oneshot';
  return `${currentPageNumber} | ${chapterLabel} - ${chapterMeta.value.mangaTitle}`;
});

function handleClick(e: MouseEvent, isDouble = false) {
  const noPageTurn = turnPages.value === TurnPagesEnum.None;

  if (
    menuOpen.value &&
    (!menuPinned.value || !$breakpoints.md.value || immersive.value)
  ) {
    settings.setMenuOpen(false);
    return;
  }

  const container = pageContainer.value?.$el;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const relativeX = (e.clientX - rect.left) / rect.width;

  const inLeftZone = relativeX < 0.33;
  const inRightZone = relativeX > 0.66;

  if (isDouble) {
    // vvv isMobileApp
    if ((noPageTurn || (!inLeftZone && !inRightZone)) && immersiveTap) {
      reader.toggleImmersive();
    }
    return;
  }

  if ((!inLeftZone && !inRightZone) || noPageTurn) {
    if (
      immersive.value
      || !$breakpoints.sm.value
      // $isMobileApp
    ) {
      reader.toggleImmersionBreak();
    } else {
      settings.toggleMenuOpen();
      e.stopPropagation();
    }
  } else {
    // Clicked **left or right zone**
    // if ($isMobileApp) {
    //   settings.setImmersionBreak(false);
    // }

    if (turnPages.value === TurnPagesEnum.Directional) { //forward only?
      // Only go forward (webtoon style)
      // if (reader.isWebtoon) scrollByAmount(1);
      // else pageManager.incrementPageGroup(1, router, true);
      // } else {
      // Normal left/right page turning
      reader.setIsClickFromPage(true);
      // if (reader.isWebtoon) {
      //   const direction =
      //     (inRightZone ? 1 : -1) * (readStyle.value === ReadStyleEnum.LTR ? 1 : -1);
      //   scrollByAmount(direction);
      // } else {
      reader.incrementPageGroup(inRightZone ? 1 : -1, router);
      // }
    }
  }
}

/**
 * Scroll by fixed amount (for webtoon mode).
 */
// function scrollByAmount(direction: number) {
//   const step = reader.isWebtoon ? window.innerHeight : 200;
//   window.scrollBy({ top: direction * step, behavior: "smooth" });
// }


defineShortcuts({
  arrowleft: () => { //todo, use keybinds
    reader.incrementPageGroup(-1, router, readStyle.value === ReadStyleEnum.LTR)
  },
  arrowright: () => {
    reader.incrementPageGroup(1, router, readStyle.value === ReadStyleEnum.LTR)
  },
  m: () => {
    menuOpen.value = !menuOpen.value
  },
})

watch([currentChapter, currentPageNumber], () => {
  document.title = pageTitle.value;
});

watch(immersive, (val) => {
  val ? enter() : exit()
})

watch(isFullscreen, (val) => {
  if (!val) reader.setImmersive(false)
})
</script>
<template>
  <div ref="root" class="mw--reader-wrap" :class="{
    'header-shown': headerStyle === HeaderStyleEnum.Shown && !immersive,
    'immersion-break': immersionBreak
  }">
    <div v-if="showContentWarning && contentWarningVisible" class="mw--reader-warning">
      <h2>Content Warning</h2>
      <p>{{ manga?.attributes.title.en }} - Chapter contains filtered out content</p>
      <button @click="router.back()">Back</button>
      <button @click="contentWarningVisible = false">OK</button>
    </div>

    <div v-else-if="is404" class="mw--reader-error">
      Chapter not found
    </div>
    <div v-else class="mw--reader-chapter" ref="readerChapter" @scroll="" :class="{
      'left-progress': progressSide === ProgressSideEnum.Left && $breakpoints.sm.value,
      'right-progress': progressSide === ProgressSideEnum.Right && $breakpoints.sm.value,
      immersive,
      // mobile: isMobileApp,
      // 'mobile-ls': isMobileApp && viewStyle === ViewStyleEnum.LongStrip,
      'mobile-ls': viewStyle === ViewStyleEnum.LongStrip,
      'header-not-floating': $breakpoints.md.value && menuPinned && headerStyle === HeaderStyleEnum.Shown
    }">
      <MangaReaderHeader />
      <MangaReaderPages ref="pageContainer" :class="{ immersive }" :imm-target="readerChapter!"
        @click="handleClick" @dblclick="(e: any) => handleClick(e, true)" />
      <MangaReaderProgressBar />
      <MangaReaderLongStripNextChapter />
    </div>
    <MangaReaderMenu />
  </div>
</template>
<style lang="css" scoped>
.mw--reader-wrap {
  display: grid;
  grid-template-areas: "chapter comments menu";
  grid-template-columns: auto min-content min-content;
  height: 100%;
  margin: 0 !important;
  min-height: 100vh;
  overflow-x: clip;
  padding: 0 !important;
  width: 100%;
  --header-padding: 0px
}

.mw--reader-wrap.header-shown:not(.immersive) {
  --header-padding: 56px
}

.mw--reader-warning {
  align-items: center;
  background-color: rgb(var(--mw-background));
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  justify-content: center;
  padding: 1.5rem;
  position: fixed;
  right: 0;
  top: 0
}

.mw--reader-chapter {
  display: grid;
  grid-template-rows: min-content auto min-content min-content;
  height: 100%
}

.mw--reader-chapter.header-not-floating {
  padding-top: var(--navbar-height)
}

.mw--reader-chapter {
  grid-template-areas: "header" "pages" "progress" "next"
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

.mw--reader-chapter.immersive {
  overflow-y: auto
}
</style>