<script setup lang="ts">
const readerStore = useScrapedReaderStore();
const readerSettings = useReaderSettingsStore();
const proxyStore = useProxy();

const pages = computed(() => readerStore.pages);
const currentPage = computed(() => readerStore.currentPage)

const imageUrls = computed(() =>
  pages.value.map(page =>
    readerStore.useProxy
      ? `${proxyStore.proxyUrl}?destination=${page.url}`
      : page.url
  )
);

const getImageClass = () => {
  const classes = [];
  switch (readerSettings.imageFit) {
    case 'fitWidth':
      classes.push('limit-width');
      break;
    case 'fitHeight':
      classes.push('limit-height');
      break;
    case 'fitBoth':
      classes.push('limit-width');
      classes.push('limit-height');
      break;
    case 'noLimit':
      break;
  }

  return classes.join(' ');
}
</script>
<template>
  <div class="min-w-0 relative pages-wrap mw--reader-pages">
    <div class="overflow-x-auto flex items-center h-full select-none" style="background: transparent;">
      <div class="mx-auto h-full mw--page w-full flex"
        style="transform-origin: left top 0px; touch-action: revert; transform: translate(0px) scale(1);">
        <NuxtImg v-if="pages" v-for="(src, index) in imageUrls" v-show="index === currentPage" :key="index" class="img sp mx-auto"
          :src="src" lazy :class="getImageClass()" />
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.mw--page {
  border-color: transparent;
  box-shadow: none;
  box-sizing: border-box;
  display: flex;
  outline-style: none;
  position: relative
}

.mw--page.grow-pages.limit-height.limit-width {
  width: 100%
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

.mw--reader-pages {
  grid-area: pages;
  width: 100%;
}

.img {
  height: unset;
  max-width: unset;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  word-break: break-all;
  --max-height: calc(100vh - var(--header-padding));
  margin-bottom: auto;
  margin-top: auto;
}

img.ls,
.img.sp {
  margin-left: auto;
  margin-right: auto;
}

.img.limit-width {
  max-width: 100%;
  min-width: 0;
  -o-object-fit: contain;
  object-fit: contain;
}

.img.limit-height {
  max-height: var(--max-height);
  min-height: 0;
}

.img.limit-width.ws {
  min-width: unset;
  width: 100%
}

.img.grow-pages.limit-height:not(.limit-width) {
  min-height: var(--max-height)
}

.img.grow-pages.limit-width:not(.limit-height):not(.dp) {
  min-width: 100%
}

.img.grow-pages.limit-width.dp {
  flex-grow: 1
}

.img.grow-pages.limit-height.limit-width.sp {
  min-height: var(--max-height);
  min-width: 100%;
  -o-object-fit: contain;
  object-fit: contain
}

.img.grow-pages.limit-height.limit-width.ls {
  min-width: 100%
}

.img.grow-pages.limit-height.limit-width.ws {
  min-height: var(--max-height)
}
</style>