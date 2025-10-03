<script setup lang="ts">
import type { ScrapedChapter, ScrapedManga } from '~~/shared/prisma/client';
import ChapterEntry from './details/content/ChapterEntry.vue';

const props = defineProps<{
  manga: ScrapedManga;
  chapterList: ScrapedChapter[];
  chapterStats?: Record<string, any>;
  statsLoading?: boolean;
}>();

const userSettings = usePreferencesStore();
// const feedStyle = computed(() => userSettings.feedStyle);
// const oneLine = computed(() => userSettings.oneLine);
const filteredLanguages = computed(() => userSettings.filteredLanguages);

const showAll = ref(false);
const expandedHeight = ref(0);
const firstThreeRef = ref<HTMLElement | null>(null);
const allChaptersRef = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | undefined;

const updateHeight = () => {
  if (allChaptersRef.value) {
    expandedHeight.value = allChaptersRef.value.scrollHeight;
  }
};

onMounted(() => {
  resizeObserver = new ResizeObserver(updateHeight);
  if (firstThreeRef.value) resizeObserver.observe(firstThreeRef.value);
  updateHeight();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

const isExpandable = computed(() => props.chapterList.length > visibleCount.value);

const visibleCount = computed(() => {
  // if (breakpoints.md) {
  //   const base = oneLine.value ? 6 : 3;
  //   return chapterList.length > base && oneLine.value ? base - 1 : base;
  // }
  // if (breakpoints.sm) {
  //   return chapterList.length > 3 ? 2 : 3;
  // }
  return 3;
});

const toggleExpand = () => {
  updateHeight();
  showAll.value = !showAll.value;
};

</script>
<template>
  <div class="chapter-feed__container" :class="{
    // compact: feedStyle === 'Compact',
    // details: feedStyle === 'Details',
    expand: isExpandable
    // && feedStyle !== 'Compact'
  }">
    <RouterLink :to="`/title/${manga.mangaDexId}`" class="chapter-feed__cover">
      <NuxtImg :src="manga.coverUrl ?? undefined" class="chapter-feed__cover-image" />
    </RouterLink>

    <RouterLink :to="`/title/${manga.mangaDexId}`" class="chapter-feed__title" :title="manga.title">
      <span>{{ manga.title }}</span>
    </RouterLink>

    <div class="chapter-feed__chapters">
      <div class="chapter-feed__chapters-list">
        <div ref="firstThreeRef">
          <ChapterEntry v-for="(chapter, index) in chapterList.slice(0, visibleCount)" :key="chapter.id"
            :chapter="chapter" />
          <!-- :manga="manga" :stats="chapterStats?.[chapter.id]" :stats-loading="statsLoading" -->
          <!-- prepend-chapter show-vol /> -->
        </div>

        <div ref="allChaptersRef" class="animated"
          :style="{ maxHeight: true ? (!isExpandable || showAll ? expandedHeight + 'px' : '0') : 'unset' }">
          <ChapterEntry v-for="(chapter, index) in chapterList.slice(visibleCount)" :key="chapter.id"
            :chapter="chapter" />
          <!-- feedStyle !== 'Compact' -->
          <!-- :manga="manga" :stats="chapterStats?.[chapter.id]" :stats-loading="statsLoading" prepend-chapter show-vol  -->
        </div>
      </div>
    </div>

    <!-- Expand/Collapse button -->
    <button v-if="isExpandable
      // && feedStyle !== 'Compact'
    " class="chapter-feed__chapters-expand" @click="toggleExpand">
      {{ showAll ? 'Show less' :
        'Show all' }}
    </button>
  </div>
</template>

<style lang="css" scoped>
.chapter-feed__container {
  background-color: rgb(var(--mw-accent));
  border-radius: .25rem;
  display: grid;
  gap: .25rem;
  column-gap: 0.25rem;
  grid-template-areas:
    "title title"
    "art   list ";
  grid-template-columns: 48px minmax(0, 1fr);
  padding: .25rem;
}

@media (min-width: 40rem) {
  .chapter-feed__container {
    -moz-column-gap: .5rem;
    column-gap: .5rem;
    padding: .5rem;
  }
}

@media (min-width: 40rem) {
  .chapter-feed__container {
    grid-template-areas:
      "art title"
      "art list ";
    grid-template-columns: 120px minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
}

@media (min-width: 48rem) {
  .chapter-feed__container {
    grid-template-columns: 140px minmax(0, 1fr);
  }
}

.chapter-feed__container.expand:not(.compact) {
  grid-template-areas:
    "title  title "
    "art    list  "
    "expand expand";
}

@media (min-width: 40rem) {
  .chapter-feed__container.expand:not(.compact) {
    grid-template-areas:
      "art title "
      "art list  "
      "art expand";
  }
}

.chapter-feed__cover {
  border-radius: .25rem;
  grid-area: art;
  height: 0;
  max-height: 0;
  max-width: 100%;
  overflow: hidden;
  padding-bottom: 72px;
  position: relative;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 40rem) {
  .chapter-feed__cover {
    padding-bottom: 142.307692%;
  }
}

.chapter-feed__title {
  align-self: center;
  border-bottom: 1px solid hsla(0, 0%, 50%, .5);
  font-size: .875rem;
  font-weight: 700;
  grid-area: title;
  line-height: 1.25rem;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 40rem) {
  .chapter-feed__title {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

.chapter-feed__chapters {
  align-self: flex-start;
  flex-grow: 1;
  grid-area: list;
}

.chapter-feed__chapters-list {
  border-radius: .25rem;
  overflow: hidden;
}

.chapter-feed__chapters-expand {
  color: var(--ui-primary);
  font-size: .875rem;
  grid-area: expand;
  line-height: 1.25rem;
  text-align: center;
  width: 100%;
}
</style>