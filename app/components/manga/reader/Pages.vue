<script setup lang="ts">
import { HeaderStyleEnum, ReadStyleEnum, ViewStyleEnum } from '~/stores/useReaderMenu';
import ManagedImage from './ManagedImage.vue';
// import ScrollToTop from './ScrollToTop.vue';

// defineProps({
//   immTarget: Object
// });

const wrapper = ref(null);
const pages = ref(null);
const zoomTarget = ref(null);

const reader = useReaderStore();
const pageManager = useReaderPageManager();
const settings = useReaderMenu();

const { currentPageGroup, scrolling, immersionBreak, greyscale } = storeToRefs(reader);

const pageHeight = ref(0);
const { pageGroups } = storeToRefs(pageManager)
const { backgroundColor } = storeToRefs(settings)

const { viewStyle, readStyle, limitWidth, maxWidthPixels, dimPages, pageDim, longStripMargin, headerStyle, growPages } = storeToRefs(useReaderMenu());

const dynamicPageClasses = computed(() => {
  let classes = '';
  if (limitWidth || growPages) classes += 'w-full ';
  return classes.trim();
});

const dimPagesFilter = computed(() => {
  // if (dimPages) return dimWithDark ? (theme.dark ? `brightness(${1 - pageDim})` : undefined) : `brightness(${1 - pageDim})`;
  if (dimPages) return `brightness(${1 - pageDim.value})`;
});

// Scroll handlers
// function handleScrollWheel(event) { /* handle wheel scrolling */ }
// function handleWideStripScroll(event) { /* handle horizontal scrolling for WideStrip */ }

// const pageElements = ref([]);
// function registerPageElement(el, index) {
//   if (!el) return;
//   if (!pageElements.value[index]) pageElements.value[index] = [];
//   pageElements.value[index].push(el);
// }

// Scroll to top utility
// function scrollToTop() {
//   pages.value?.scrollIntoView({ behavior: 'smooth' });
// }

// Resize handler for dynamic height
// function updatePageHeight() {
//   pageHeight.value = window.innerHeight;
// }

// onMounted(() => {
//   window.addEventListener('resize', updatePageHeight);
//   window.addEventListener('scroll', handleWideStripScroll, { passive: true });
//   updatePageHeight();
// });

// onBeforeUnmount(() => {
//   window.removeEventListener('resize', updatePageHeight);
//   window.removeEventListener('scroll', handleWideStripScroll);
// });
</script>
<template>
  <div class="min-w-0 relative pages-wrap mw--reader-pages" :class="{ ls: viewStyle === ViewStyleEnum.LongStrip }"
    :style="{ minHeight: pageHeight ? pageHeight + 'px' : undefined }" ref="wrapper">
    <!-- Page container -->
    <div class="overflow-x-auto flex items-center h-full select-none" :class="{ bw: greyscale }" :style="{
      background: backgroundColor,
      direction: readStyle === ReadStyleEnum.RTL && viewStyle === ViewStyleEnum.WideStrip ? 'rtl' : undefined
    }" ref="pages">
      <!-- @scroll="handleWideStripScroll" -->
      <!-- @wheel="handleScrollWheel" -->
      <div class="mx-auto h-full" v-if="pageGroups.length && pageGroups[currentPageGroup]" :class="{
        'mw--page': viewStyle !== ViewStyleEnum.LongStrip && viewStyle !== ViewStyleEnum.WideStrip,
        'header-shown': headerStyle === HeaderStyleEnum.Shown,
        flex: viewStyle !== ViewStyleEnum.LongStrip,
        'grid grid-cols-2': viewStyle === ViewStyleEnum.DoublePage && pageGroups[currentPageGroup]!.length === 2 && pageGroups[currentPageGroup]!.some(p => !p.loaded),
        rtl: readStyle === ReadStyleEnum.RTL && viewStyle === ViewStyleEnum.WideStrip,
        [dynamicPageClasses]: true
      }" :style="{
          maxWidth: limitWidth && viewStyle !== ViewStyleEnum.WideStrip ? maxWidthPixels : undefined,
          filter: dimPagesFilter,
          columnGap: viewStyle === ViewStyleEnum.WideStrip ? longStripMargin + 'px' : undefined,
          // transform: transformStyle
        }" ref="zoomTarget">
        <!-- No pages fallback -->
        <template v-if="pageGroups.length === 0">
          <div class="m-4 flex-grow">
            This chapter has no pages
          </div>
        </template>

        <!-- Render page groups -->
        <template v-else>
          <template v-for="(group, groupIndex) in pageGroups" :key="groupIndex">
            <ManagedImage v-for="(page, pageIndex) in group" :key="page.pageNum" :managedImage="page"
              :show="reader.showImagePage(groupIndex)"
              :class="group.length > 1 ? (pageIndex === 0 ? 'ml-auto' : 'mr-auto') : 'mx-auto'"
              ref="el => registerPageElement(el, groupIndex)" 
              :style="{
                maxWidth: limitWidth && viewStyle === ViewStyleEnum.WideStrip ? maxWidthPixels : undefined,
                objectPosition: group.length > 1 ? (pageIndex === 0 ? 'right' : 'left') : undefined
              }" />
          </template>
        </template>
      </div>
    </div>

    <!-- <ScrollToTop v-if="immersionBreak && !scrolling && viewStyle === ViewStyleEnum.LongStrip" @click.stop.prevent="scrollToTop" /> -->
  </div>
</template>


<style lang="css" scoped>
.mw--reader-pages {
  grid-area: pages;
  width: 100%;
}

.pages-wrap {
  min-height: calc(100vh - var(--header-padding))
}

.pages-wrap.ls {
  min-height: calc(100vh - var(--header-padding) - 3rem)
}

@supports (min-height:100dvh) {
  .pages-wrap {
    min-height: calc(100dvh - var(--header-padding))
  }

  .pages-wrap.ls {
    min-height: calc(100dvh - var(--header-padding) - 3rem)
  }
}
</style>
