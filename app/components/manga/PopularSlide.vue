<script setup lang="ts">
import { useMangaAuthor } from '~/composables/useMangaAuthor';
import { useMangaCover } from '~/composables/useMangaCover';
import { toKebabCase } from '~/utils/kebab-case';
import type { Manga } from '~~/shared/types/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const coverUrl = useMangaCover(manga).coverUrl;
const title = useMangaTitle(manga);
const contentRating = manga.attributes?.contentRating
const tags = manga.attributes?.tags!
const description = manga.attributes?.description
const { authors, artists, samePeople } = useMangaAuthor(manga);
</script>

<template>
  <NuxtLink class="flex relative h-full overflow-hidden shadow banner-bg"
    :href="`/title/${manga.id}/${toKebabCase(title!)}`" style="height: 400px;">
    <!-- dont do var! lol this is temp-->
    <NuxtImg class="absolute left-0 top-0 w-[100%] h-[150%] object-cover select-none" :src="coverUrl" alt=""
      loading="lazy" style="object-position: 0px 30%;" />
    <div class="absolute banner-bg inset-0"></div>
    <div
      class="p-4 mb-6 md:mb-0 md:py-4 md:px-4 grid grid-rows-[1fr_1rem] md:grid-rows-1 gap-2 md:h-[77%] sm:h-[65%] h-[70%] mt-auto xl:max-w-[1440px] w-full mx-auto">
      <div class="h-full relative z-20 flex gap-4">
        <NuxtLink :href="`/title/${manga.id}/${toKebabCase(title!)}`"
          class="group flex items-start relative mb-auto select-none !h-[10rem] md:!h-full aspect-[7/10] !w-auto object-top object-cover rounded sm:shadow-lg bg-transparent">
          <!----><!---->
          <NuxtImg class="rounded shadow-md w-full h-full" :src="coverUrl" alt="Cover image" />
          <!-- <img class="inline-block select-none absolute right-2 bottom-1.5" title="English"
                        src="/img/flags/gb.svg" alt="English flag icon" width="24" height="24" style="z-index: 1;">-->
        </NuxtLink>
        <div class="mt-auto grid gap-6 sm:gap-2 h-full"
          style="min-height: 0px; grid-template-rows: max-content min-content auto max-content;">
          <h2 class="font-bold text-xl line-clamp-5 sm:line-clamp-2 lg:text-4xl overflow-hidden"
            style="line-height: 2.75rem;">{{ title }}</h2>
          <MangaTagsRow class="overflow-hidden" :tags="tags" :contentRating="contentRating"></MangaTagsRow>
          <div class="preview-description">
            <div class="relative overflow-hidden py-0">
              <div class="mw-container dense noEmptyLines">
                <p>{{ description?.en }}</p>
              </div>
            </div>
          </div>
          <div class="truncate sm:mr-36 mr-4">
            <span class="font-medium italic">
              <template v-if="samePeople">
                {{authors.map(a => a.attributes?.name).join(', ')}}
              </template>
              <template v-else>
                {{authors.map(a => a.attributes?.name).join(', ')}},
                {{artists.map(a => a.attributes?.name).join(', ')}}
              </template>
            </span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
<style lang="css" scoped>
.banner-bg {
  background: linear-gradient(to bottom,
      rgb(var(--mw-background) / 0.6),
      rgb(var(--mw-background)));
}
</style>
