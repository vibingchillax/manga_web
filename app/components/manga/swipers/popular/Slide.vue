<script setup lang="ts">
import type { Manga } from '~~/shared/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const { title, description, detailsUrl, author, cover, contentRating, tags } = useManga(manga)
</script>

<template>
  <NuxtLink class="flex relative h-full overflow-hidden shadow banner-bg"
    :href="detailsUrl" style="height: 400px;">
    <NuxtImg class="absolute left-0 top-0 w-[100%] h-[150%] object-cover select-none" :src="cover.urlOriginal" alt=""
      loading="lazy" style="object-position: 0px 30%;" placeholder />
    <div class="absolute banner-bg inset-0"></div>
    <div
      class="p-4 mb-6 md:mb-0 md:py-4 md:px-4 grid grid-rows-[1fr_1rem] md:grid-rows-1 gap-2 md:h-[77%] sm:h-[65%] h-[70%] mt-auto xl:max-w-[1440px] w-full mx-auto">
      <div class="h-full relative z-20 flex gap-4">
        <MangaCover :manga="manga" noTitle showFlag :use256="false" fillHeight
          class="!h-[10rem] md:!h-full aspect-[7/10] !w-auto object-top object-cover rounded sm:shadow-lg bg-transparent select-none"  
        />
        <div class="mt-auto grid gap-6 sm:gap-2 h-full"
          style="min-height: 0px; grid-template-rows: max-content min-content auto max-content;">
          <h2 class="font-bold text-xl line-clamp-5 sm:line-clamp-2 lg:text-4xl overflow-hidden"
            style="line-height: 2.75rem;">{{ title }}</h2>
          <TagsRow :rows="1" class="overflow-hidden"> <!-- bp ? 1 : 2-->
            <MangaTag v-if="contentRating" :value="contentRating" /> 
            <MangaTag v-for="tag in sortedTags(tags)" :key="tag.id" 
              :value="tag.attributes?.name?.en!"
              :to="routeToTag(tag)"
              class="bg-accent"
            />
          </TagsRow>
          <div class="preview-description">
            <div class="relative overflow-hidden py-0">
              <div class="mw-container dense noEmptyLines">
                <p>{{ description?.en }}</p>
              </div>
            </div>
          </div>
          <div class="truncate sm:mr-36 mr-4">
            <span class="font-medium italic">
              <template v-if="author.samePeople">
                {{author.authors.map(a => a.attributes?.name).join(', ')}}
              </template>
              <template v-else>
                {{author.authors.map(a => a.attributes?.name).join(', ')}},
                {{author.artists.map(a => a.attributes?.name).join(', ')}}
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
