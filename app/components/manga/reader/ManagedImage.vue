<script setup lang="ts">
const props = defineProps<{ managedImage: ManagedImage, show: boolean }>();

const {
  growPages,
  limitHeight,
  limitMaxHeight,
  limitWidth,
  maxHeightPixels,
  lockOffset,
  longStripMargin,
  viewStyle
} = storeToRefs(useReaderMenu());

const containerStyles = computed(() => {
  return {
    paddingTop: `calc(${lockOffset}px + var(--header-padding))`,
    marginTop: `calc(-${lockOffset}px - var(--header-padding))`,
    marginBottom: `${longStripMargin}px`
  };

});

const pageClasses = computed(() => {
  let classes = '';

  switch (viewStyle.value) {
    case ViewStyleEnum.LongStrip: classes += 'ls '; break;
    case ViewStyleEnum.WideStrip: classes += 'ws '; break;
    case ViewStyleEnum.SinglePage: classes += 'sp '; break;
    case ViewStyleEnum.DoublePage: classes += 'dp '; break;
  }

  if (limitWidth) classes += 'limit-width ';
  if (limitHeight) classes += 'limit-height ';
  if (growPages) classes += 'grow-pages';

  return classes.trim();
});

const imageStyles = computed(() => {
  if (limitHeight && limitMaxHeight) {
    return { maxHeight: maxHeightPixels.value, minHeight: '0' };
  }
  return {};
});

</script>
<template>
  <div v-if="!managedImage.fetching && !managedImage.loaded && !managedImage.blobUrl" class="unloaded"
    @click.prevent.stop="managedImage.retry() && managedImage.retry()" v-show="show">
    Load Image
  </div>

  <div v-else-if="managedImage.loaded && !managedImage.blobUrl" class="error"
    @click.prevent.stop="managedImage.retry && managedImage.retry()" v-show="show">
    Click to retry
  </div>

  <div v-else-if="managedImage.fetching"
    class="flex justify-center items-center p-2 text-primary overflow-hidden w-full">
    Loading...
    <!-- <LoadingSpinner size="5rem" /> -->
  </div>

  <div v-else-if="viewStyle === ViewStyleEnum.LongStrip" class="mw--page" :class="pageClasses" :style="containerStyles">
    <img class="img" :class="pageClasses" :src="managedImage.blobUrl ?? undefined" :style="imageStyles" />
  </div>

  <img v-else :src="managedImage.blobUrl ?? undefined" class="img" :class="pageClasses" :style="imageStyles"
    v-show="show" />
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

.unloaded {
  cursor: pointer;
  text-align: center;
  color: var(--primary-color);
}

.error {
  cursor: pointer;
  text-align: center;
  color: red;
}
</style>
