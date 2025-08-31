<script setup lang="ts">
import { HeaderStyleEnum, ReadStyleEnum, ViewStyleEnum } from '~/stores/useReaderMenu';
import ManagedImage from './ManagedImage.vue';

defineProps<{ immTarget?: HTMLElement }>()

const reader = useReaderStore();
const pageManager = useReaderPageManager();
const settings = useReaderMenu();

const { setIsClickFromPage, setCurrentPageGroup, setScrollbarOffset, incrementPageGroup,
  setCurrentProgress, showImagePage, setImmersionBreak, setAtTop
} = reader

const { scrolling, immersive, isClickFromPage, currentPageGroup, currentProgress, greyscale,
  immersionBreak
} = storeToRefs(reader);

const { viewStyle, readStyle, headerStyle, shouldAutoScroll, doAutoAdvance, limitHeight,
  limitWidth, growPages, dimPages, dimWithDark, pageDim, longStripMargin, maxWidthPixels,
  backgroundColor, progressSide } = storeToRefs(settings);

const { pageGroups, pageItems } = storeToRefs(pageManager)

const rootEl = ref<HTMLElement | null>(null)
const pagesEl = ref<HTMLElement | null>(null)
const pageRefs = ref<any[][]>([]) //?!
const isAutoScrolling = ref(false)
const scrollBlock = ref(false)
const zoomTarget = ref<HTMLElement | null>(null)
const pageHeight = ref(0);
const scrollBaseline = ref<number | null>(null)

const updateViewportHeight = () => {
  pageHeight.value = window.innerHeight
}

const resetScrollBaseline = () => {
  scrollBaseline.value = null
}

const dynamicPageClasses = computed(() => {
  let classes = '';
  if (limitWidth || growPages) classes += 'w-full ';
  return classes.trim();
});

const dimPagesFilter = computed(() => {
  // if (dimPages) return dimWithDark ? (theme.dark ? `brightness(${1 - pageDim})` : undefined) : `brightness(${1 - pageDim})`;
  if (dimPages) return `brightness(${1 - pageDim.value})`;
});

// const visiblePageInGroup = (idx: number) => {
//   const group = pageRefs.value[idx]
//   if (!group || !group.length) return
//   return group.reduce((biggest, cmp) => {
//     const h = cmp?.$el.getBoundingClientRect().height ?? 0
//     const bh = biggest?.$el.getBoundingClientRect().height ?? 0
//     return h > bh ? cmp : biggest
//   })
// }

// const calcLongStripProgress = () => {
//   let offset = 0
//   let containerHeight = pagesEl.value?.getBoundingClientRect().height ?? 0

//   const lastVisible = visiblePageInGroup(pageGroups.value.length - 1)
//   if (lastVisible) {
//     containerHeight -= lastVisible.$el.getBoundingClientRect().height
//   }
//   if (containerHeight === 0) return 0

//   for (let i = 0; i < pageGroups.value.length; i++) {
//     const cmp = visiblePageInGroup(i)
//     if (!cmp) continue

//     const rect = cmp.$el.getBoundingClientRect()
//     const ratio = offset / containerHeight
//     const cutoff = window.innerHeight * ratio

//     if (rect.top >= 0 && rect.top <= cutoff) return i
//     if (rect.top >= cutoff) return i - 1

//     offset += rect.height
//   }
//   return pageGroups.value.length - 1
// }

// const handleScroll = (evt: Event) => {
//   // handleImmersiveScroll(evt)
//   if (scrolling.value) return

//   const el = pagesEl.value
//   if (!el) return

//   const rect = el.getBoundingClientRect()
//   if (el.scrollWidth > el.clientWidth) {
//     setScrollbarOffset(Math.min(Math.round(rect.bottom - (el.offsetHeight - el.clientHeight) - window.innerHeight), 0))
//   } else {
//     setScrollbarOffset(0)
//   }

//   if (viewStyle.value === ViewStyleEnum.LongStrip) {
//     const scrolled = Math.max(-(rect.top - Math.min(window.scrollY - rect.top, 0)), 0)
//     const maxScroll = Math.max(rect.height - window.innerHeight, 1)
//     const progress = scrolled / maxScroll
//     setCurrentProgress(Math.max(0, Math.min(1, progress)))

//     const groupIdx = calcLongStripProgress()
//     if (groupIdx !== currentPageGroup.value) {
//       isAutoScrolling.value = true
//       setCurrentPageGroup(Math.max(0, groupIdx))
//     }
//   }
// }

// watch(currentPageGroup, (newVal, oldVal) => {
//   if (oldVal !== newVal && viewStyle.value !== ViewStyleEnum.WideStrip && viewStyle.value !== ViewStyleEnum.LongStrip) {
//     // resetZoom()
//   }
//   // if (!isWebtoon.value) {
//   setCurrentPageGroup(newVal) //?
//   if (isClickFromPage.value) {
//     setIsClickFromPage(false)
//   }
//   // }
// })

// watch(currentProgress, (val) => {
//   if (scrolling.value && viewStyle.value === ViewStyleEnum.LongStrip) {
//     const rect = pagesEl.value?.getBoundingClientRect()
//     if (!rect) return
//     const top = rect.top + window.scrollY
//     const bottom = rect.height - window.innerHeight - rect.top
//     // if (immersive.value) {
//     //   props.immTarget?.scrollTo(0, val * props.immTarget.scrollHeight)
//     // } else {
//     //   window.scrollTo(0, top + val * bottom)
//     // }
//     window.scrollTo(0, top + val * bottom)
//   }
// })

// onMounted(() => {
//   window.addEventListener("scroll", handleScroll, { passive: true })
// })

// onBeforeUnmount(() => {
//   window.removeEventListener("scroll", handleScroll)
// })

// defineExpose({
//   handleScroll
// })
</script>
<template>
  <div class="min-w-0 relative pages-wrap mw--reader-pages" :class="{ ls: viewStyle === ViewStyleEnum.LongStrip }"
    :style="{ minHeight: pageHeight ? pageHeight + 'px' : undefined }" ref="rootEl">

    <div class="overflow-x-auto flex items-center h-full select-none" :class="{ bw: greyscale }" :style="{
      background: backgroundColor,
      direction: readStyle === ReadStyleEnum.RTL && viewStyle === ViewStyleEnum.WideStrip ? 'rtl' : undefined
    }" ref="pagesEl" @scroll="viewStyle === ViewStyleEnum.WideStrip ? null : null">
      <!-- handleScroll -->
      <!-- @scroll="handleWideStripScroll" -->
      <!-- @wheel="handleScrollWheel" -->
      <div ref="zoomTarget" class="mx-auto h-full" v-if="pageGroups.length && pageGroups[currentPageGroup]" :class="{
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
      }">

        <template v-if="pageGroups.length === 0">
          <div class="m-4 flex-grow">
            This chapter has no pages
          </div>
        </template>

        <template v-else>
          <template v-for="(group, groupIndex) in pageGroups" :key="groupIndex">
            <ManagedImage v-for="(page, pageIndex) in group" :key="page.pageNum" :managedImage="page"
              :show="reader.showImagePage(groupIndex)"
              :class="group.length > 1 ? (pageIndex === 0 ? 'ml-auto' : 'mr-auto') : 'mx-auto'" :style="{
                maxWidth: limitWidth && viewStyle === ViewStyleEnum.WideStrip ? maxWidthPixels : undefined,
                objectPosition: group.length > 1 ? (pageIndex === 0 ? 'right' : 'left') : undefined
              }"
              ref="el => { if (el) { pageRefs[groupIndex] ? pageRefs[groupIndex].push(el) : pageRefs[groupIndex] = [el]}}" />
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
