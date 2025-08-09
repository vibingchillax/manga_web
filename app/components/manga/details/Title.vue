<script setup lang="ts">
import { useMangaAuthor } from '~/composables/useMangaAuthor';
import type { Manga } from '~~/shared/types/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const title = useMangaTitle(manga);
const altTitles = manga.attributes?.altTitles
const preferredAltTitle = computed(() => {
  const priority = ['en', 'ja', 'kr']; // TODO user preferences

  for (const key of priority) {
    const match = altTitles?.find(title => key in title);
    if (match) return match[key];
  }

  const first = altTitles?.find(title => Object.values(title)[0]);
  return first ? Object.values(first)[0] : null;
});
const { authors, artists, samePeople } = useMangaAuthor(manga);
</script>

<template>
  <div class="title">
    <p class="mb-1"
      style="line-height: 1.1em; overflow-wrap: break-word; text-shadow: rgba(0, 0, 0, 0.3) 1px 2px 4px; font-size: 3rem; width: 728px;">
      {{ title }}</p>
    <div v-if="preferredAltTitle" class="font-normal line-clamp-2 text-base sm:text-xl inline-block leading-5"
      :title="preferredAltTitle">
      {{ preferredAltTitle }}
    </div>

    <div class="flex-grow hidden sm:block"></div>
    <div class="flex flex-grow gap-2">
      <div class="font-normal text-xs sm:text-base truncate">
        <template v-if="samePeople">
          {{authors.map(a => a.attributes?.name).join(', ')}}
        </template>
        <template v-else>
          {{authors.map(a => a.attributes?.name).join(', ')}},
          {{artists.map(a => a.attributes?.name).join(', ')}}
        </template>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.title {
  display: flex;
  flex-direction: column;
  font-size: 24px;
  font-weight: 700;
  grid-area: title;
  line-height: 100%;
  min-width: 0;
  position: relative
}

@media (min-width:40rem) {
  .title {
    padding-bottom: .5rem;
    padding-left: .5rem;
    padding-right: .5rem;
    --tw-text-opacity: 1;
    color: rgb(255 255 255/var(--tw-text-opacity, 1));
    height: var(--banner-height);
    justify-content: flex-end
  }
}
</style>
