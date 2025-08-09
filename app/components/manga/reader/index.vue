<script setup lang="ts">
import type { Chapter, Page } from '@manga_web/sources';
const props = defineProps<{ chapter: Chapter }>();
const { data, pending, error } = useFetch('/api/pages', {
  query: {
    chapter: JSON.stringify(props.chapter)
  }
})
const pages: Page[] = data.value ?? [];
const currentPage = ref(0);
const totalPages = pages.length;
</script>
<template>
  <div class="mw--reader-wrap">
    <div class="mw--reader-chapter">
      <div class="reader--header hide mw-reader-header">
        <div class="flex-grow">
          <div class="reader--header-title">
            <!-- {{ chapter.chapterNumber, chapter.chapterTitle }} -->
          </div>
          <NuxtLink class="reader--header-manga"></NuxtLink>
        </div>
        <div class="reader--header-meta">
          <div class="reader--header chapter">
            Ch. {{ chapter.chapterNumber }}
          </div>
          <div class="reader--header page">
            Pg. {{ currentPage }} / {{ totalPages }}
          </div>
          <div class="reader--header menu">
            Menu
            <Icon name="i-lucide-chevron-left" />
          </div>
        </div>
        <div class="reader--header groups">
          <div class="flex items-center">
            <!-- user / uploader icon -->
            <div class="flex items-center space-x-1">
              <NuxtLink class="group-tag"></NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <div class="min-w-0 relative pages-wrap md--reader pages">
        <div class="overflow-x-auto flex items-center h-full select-none" style="background: transparent;">
          <div class="mx-auto h-full md--page w-full flex"
            style="transform-origin: left top 0px; touch-action: revert; transform: translate(0px) scale(1);">
            <NuxtImg class="img sp-limit-width mx-auto" v-for="image in data" :src="image.url"></NuxtImg>
          </div>
        </div>
      </div>
      <div class="reader-progress-wrap normal mw--reader-progress">
        <div class="reader--menu open pinned header-hidden">
          
        </div>
      </div>
    </div>
    <div class="mw--reader-menu"></div>
    <div id="reader-menu-attach"></div>
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
</style>