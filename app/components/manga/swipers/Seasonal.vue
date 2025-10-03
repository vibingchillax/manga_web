<script setup lang="ts">
import type { SwiperContainer } from 'swiper/element'
import 'swiper/css/bundle';

const swiperContainerRef = ref<SwiperContainer | null>(null);
const swiper = useSwiper(swiperContainerRef);

const preferences = usePreferencesStore();
const { contentRating } = storeToRefs(preferences)

const { data } = await useMangadex('/list/{id}', {
  path: {
    id: '68ab4f4e-6f01-4898-9038-c5eee066be27' //list gets changed or list gets updated?
  },
  key: 'seasonal_ids'
})

const seasonal = computed(() => data.value?.data?.attributes?.name)
const idList = computed(() => data.value?.data?.relationships
  ?.filter((r): r is { id: string; type: "manga" } => r.type === "manga" && !!r.id)
  .map(r => r.id) ?? []);

const { data: mangasList, pending, error } = await useMangadex('/manga', {
  query: {
    limit: 32,
    offset: 0,
    "includes[]": ["cover_art"],
    "order[createdAt]": "desc",
    "order[followedCount]": "desc",
    "contentRating[]": contentRating.value,
    "ids[]": idList.value
  } as any,
  watch: [contentRating],
  key: 'seasonal'
})

</script>
<template>
  <div class="header overflow-hidden">
    <div class="flex justify-between items-center text-2xl mb-4">
      <NuxtLink to="/titles/seasonal">
        <h2 class="font-header font-semibold">
          {{ seasonal }}
        </h2>
      </NuxtLink>
      <NuxtLink class="custom-opacity relative flex items-center overflow-hidden accent text rounded-full !px-0"
        to="/titles/seasonal">
        <UButton icon="i-lucide-arrow-right" variant="ghost" />
      </NuxtLink>
    </div>
    <ClientOnly>
      <swiper-container slides-per-view="auto" space-between="20" :loop="true" :pagination="{
        clickable: true,
        dynamicBullets: true,
        el: '.swiper-pagination',
        type: 'bullets'
      }" :mousewheel="true">
        <swiper-slide v-for="(manga, index) in mangasList?.data" :key="index" style="max-width: 192px; flex: 0 0 auto;">
          <div>
            <NuxtLink class="group flex items-start relative mb-auto select-none w-full h-full aspect-[5/7]"
              :to="useManga(manga).detailsUrl.value">
              <NuxtImg class="rounded shadow-md w-full h-full" :src="useManga(manga).cover.value.coverUrl256">
              </NuxtImg>
            </NuxtLink>
            <NuxtLink :to="useManga(manga).detailsUrl.value">
              <h6 class="mt-2 text-sm line-clamp-2">
                {{ useManga(manga).title }}
              </h6>
            </NuxtLink>
          </div>
        </swiper-slide>

      </swiper-container>
    </ClientOnly>
  </div>
</template>