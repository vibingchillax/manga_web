<script setup lang="ts">
import dayjs from 'dayjs';
import type { SwiperContainer } from 'swiper/element'

const swiperContainerRef = ref<SwiperContainer | null>(null);
const swiper = useSwiper(swiperContainerRef, {
  loop: true,
  autoplay: {
    delay: 8000
  }
});

const currentSlideIndex = ref(0);

const onSlideChange = () => {
  currentSlideIndex.value = swiper.realIndex.value
}

const isoLocal = dayjs().subtract(31, 'day').hour(17).minute(0).second(0).format('YYYY-MM-DDTHH:mm:ss');
const preferences = usePreferencesStore();
const { data, pending, error } = await useMangadex("/manga", {
  query: {
    'includes[]': ['cover_art', 'author', 'artist'],
    'contentRating[]': preferences.contentRating,
    'order[followedCount]': 'desc', //it's all because of this line
    hasAvailableChapters: 'true',
    createdAtSince: isoLocal,
    limit: 10
  } as any, //💀,
  key: 'popular'
})

</script>
<template>
  <div class="relative !p-0 !m-0 -top-16 left-0 w-full">
    <div class="absolute top-14 sm:top-16 left-0 w-full z-[5]">
      <div class="max-w-[1440px] mx-auto px-4">
        <h2 class="font-header sm:text-2xl text-xl font-semibold"> Popular New Titles </h2>
      </div>
    </div>
    <div>
      <ClientOnly>
        <swiper-container ref="swiperContainerRef" @swiperslidechange="onSlideChange">
          <swiper-slide v-for="(manga, index) in data?.data" :key="index">
            <MangaPopularSlide :manga="manga" />
          </swiper-slide>
        </swiper-container>
      </ClientOnly>
      <div class="absolute w-full bottom-2 left-0 pointer-events-none z-[3]">
        <div class="flex justify-end items-center gap-4 max-w-[1440px] mx-auto px-4">
          <span class="uppercase text-sm font-semibold" style="z-index: 4;"
            :class="{ 'text-primary': currentSlideIndex === 0 }">No.
            {{ currentSlideIndex + 1 }}</span>

          <button @click="swiper.prev()" class="prev p-1 pointer-events-auto relative flex items-center justify-center rounded-full w-10 h-10
         transition duration-200 ease-in-out hover:bg-gray-700 hover:shadow-md">
            <Icon name="i-lucide-chevron-left" class="w-5 h-5" />
          </button>

          <button @click="swiper.next()" class="next p-1 pointer-events-auto relative flex items-center justify-center rounded-full w-10 h-10
         transition duration-200 ease-in-out hover:bg-gray-700 hover:shadow-md">
            <Icon name="i-lucide-chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>