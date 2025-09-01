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
const pageRefs = ref<InstanceType<typeof ManagedImage>[][]>([])
const isAutoScrolling = ref(false)
const scrollBlock = ref(false)
const zoomTarget = ref<HTMLElement | null>(null)
const pageHeight = ref(0);
const lastScrollY = ref<number | null>(null)

const updateViewportHeight = () => {
  pageHeight.value = window.innerHeight
}

const resetScroll = () => {
  lastScrollY.value = null
}

const scrollToTop = () => {
  pagesEl?.value?.scrollIntoView({ behavior: "smooth" });
};

const dynamicPageClasses = computed(() => {
  let classes = '';
  if (limitWidth.value || growPages.value) classes += 'w-full ';
  return classes.trim();
});

const dimPagesFilter = computed(() => {
  // if (dimPages) return dimWithDark ? (theme.dark ? `brightness(${1 - pageDim})` : undefined) : `brightness(${1 - pageDim})`;
  if (dimPages.value) return `brightness(${1 - pageDim.value})`;
});

const visiblePageInGroup = (idx: number) => {
  const group = pageRefs.value[idx]
  if (!group || !group.length) return
  return group.reduce((biggest, cmp) => {
    const h = cmp?.$el.getBoundingClientRect().height ?? 0
    const bh = biggest?.$el.getBoundingClientRect().height ?? 0
    return h > bh ? cmp : biggest
  })
}

const calcLongStripProgress = () => {
  const container = pagesEl.value;
  if (!container) return 0;
  let totalHeight = container.getBoundingClientRect().height
  const lastEl = visiblePageInGroup(pageGroups.value.length - 1)
  if (lastEl) totalHeight -= lastEl.$el.getBoundingClientRect().height
  if (totalHeight === 0) return 0

  let accumulatedHeight = 0
  for (let i = 0; i < pageGroups.value.length; i++) {
    const groupEl = visiblePageInGroup(i)
    if (!groupEl) continue
    const { top, height } = groupEl.$el.getBoundingClientRect()
    const ratio = accumulatedHeight / totalHeight
    const viewportHeight = window.innerHeight * ratio
    accumulatedHeight += height
    if (top >= 0 && top <= viewportHeight) return i
    if (top >= viewportHeight) return i - 1
  }
  return pageGroups.value.length - 1
  // let currentIndex = 0;

  // for (let i = 0; i < pageRefs.value.length; i++) {
  //   const page = visiblePageInGroup(i);
  //   if (!page) continue;

  //   const rect = page.$el.getBoundingClientRect();
  //   if (rect.top <= window.innerHeight * 0.5) {
  //     currentIndex = i;
  //   } else {
  //     break;
  //   }
  // }
  // return currentIndex;
}

function handleScroll(e?: Event) {
  if (scrolling.value) return
  const container = pagesEl.value;
  if (!container) return;

  const rect = container.getBoundingClientRect()

  if (container.scrollWidth > container.clientWidth) {
    setScrollbarOffset(Math.min(Math.round(rect.bottom - (container.offsetHeight - container.clientHeight) - window.innerHeight), 0))
  } else {
    setScrollbarOffset(0)
  }

  if (viewStyle.value === ViewStyleEnum.LongStrip) {
    const scrollTop = Math.max(-(rect.top - Math.min(window.scrollY - rect.top, 0)), 0);
    const totalHeight = Math.max(rect.height - window.innerHeight, 1);
    setCurrentProgress(Math.max(0, Math.min(1, scrollTop / totalHeight)));

    const pageIndex = calcLongStripProgress();
    if (pageIndex !== currentPageGroup.value) {
      scrollBlock.value = true; //i dont know why this is here
      setCurrentPageGroup(Math.max(0, pageIndex));
    }
  }
  // const scrollTop = container.scrollTop;
  // const scrollHeight = container.scrollHeight - container.clientHeight;
  // reader.setCurrentProgress(Math.max(0, Math.min(1, scrollTop / scrollHeight)));

  // const currentPage = calcLongStripProgress();
  // if (currentPage) reader.setCurrentPageGroup(currentPage);
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const scrollToPage = async (index: number) => {
  await nextTick()
  const el = pageRefs.value[index]?.[0]?.$el
  el?.scrollIntoView()
}

watch(currentPageGroup, async (newVal, oldVal) => {
  if (!immersive.value && !scrolling.value && shouldAutoScroll.value) {
    scrollToPage(newVal)
    isClickFromPage.value = false
  }
  setCurrentProgress(newVal / pageGroups.value.length)
})
</script>
<template>
  <div class="min-w-0 relative pages-wrap mw--reader-pages" :class="{ ls: viewStyle === ViewStyleEnum.LongStrip }"
    :style="{ minHeight: pageHeight ? pageHeight + 'px' : undefined }" ref="rootEl">

    <div class="overflow-x-auto flex items-center h-full select-none" :class="{ bw: greyscale }" :style="{
      background: backgroundColor,
      direction: readStyle === ReadStyleEnum.RTL && viewStyle === ViewStyleEnum.WideStrip ? 'rtl' : undefined
    }" ref="pagesEl" @scroll="handleScroll">
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
              }" :ref="el => {
                if (el) {
                  if (pageRefs[groupIndex]) {
                    pageRefs[groupIndex].push(el as InstanceType<typeof ManagedImage>)
                  } else {
                    pageRefs[groupIndex] = [el as InstanceType<typeof ManagedImage>]
                  }
                }
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
