<script setup lang="ts">
const { $breakpoints } = useNuxtApp();

const reader = useReaderStore();
const settings = useReaderMenu();

const { setMenuOpen } = settings;
const { toggleImmersive } = reader;

const { chapterMeta, chapterState, immersive, immersionBreak, scrolling } =
  storeToRefs(reader);
</script>
<template>
  <div
    v-if="!$breakpoints.sm.value && !immersive"
    class="non-app-mobile"
    :class="{
      break: immersionBreak,
      '!opacity-0': scrolling,
    }"
  >
    <UButton
      variant="ghost"
      color="neutral"
      class="-ml-2 mr-2"
      :icon="immersive ? 'i-lucide-minimize' : 'i-lucide-expand'"
      size="sm"
      @click.prevent.stop="toggleImmersive"
    />
    <div>
      <NuxtLink
        v-if="chapterMeta.mangaLink || chapterState === 'pgonly'"
        :to="chapterMeta.mangaLink"
        class="reader--header-manga text-left"
      >
        {{ chapterMeta.mangaTitle }}
      </NuxtLink>

      <USkeleton v-else class="h-5 mb-1 rounded" />

      <div
        v-if="chapterMeta.chapterTitle"
        class="reader--header-title text-left"
      >
        {{ chapterMeta.chapterTitle }}
      </div>

      <USkeleton
        v-else-if="chapterState !== 'pgonly'"
        class="h-6 mb-1 rounded"
      />
    </div>

    <UButton
      class="ml-auto -mr-2"
      icon="i-lucide-menu"
      size="sm"
      variant="ghost"
      color="neutral"
      @click.prevent.stop="setMenuOpen(true)"
    />
  </div>
</template>
<style lang="css" scoped>
.non-app-mobile {
  background-color: rgb(var(--mw-background) / 0.8);
  display: flex;
  height: 60px;
  left: 0;
  margin-bottom: -60px;
  opacity: 0;
  padding: 0.5rem 1rem;
  pointer-events: none;
  position: sticky;
  top: var(--header-padding);
  transition: opacity 75ms ease-in-out;
  width: 100%;
  z-index: 2;
}

.non-app-mobile.break {
  opacity: 1;
  pointer-events: all;
}

.non-app-mobile > div > .reader--header-title {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.non-app-mobile > div > .reader--header-manga,
.non-app-mobile > div > .reader--header-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-align: left;
  word-break: break-all;
}

.non-app-mobile > div > .reader--header-manga {
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>
