<script setup lang="ts">
const swiperContainerRef = ref(null);
const swiper = useSwiper(swiperContainerRef, {
  loop: true,
  autoplay: {
    delay: 10000,
  },
});
const { mangas, pending, error } = useMangaPopular();

</script>
<template>
  <div class="relative !p-0 !m-0 -top-16 left-0 w-full">
    <div class="absolute top-14 sm:top-16 left-0 w-full z-[5]">
      <div class="max-w-[1440px] mx-auto px-4">
        <h2 class="font-header sm:text-2xl text-xl font-semibold"> Popular New Titles </h2>
      </div>
    </div>
    <div>
      <swiper-container ref="swiperContainerRef">
        <swiper-slide v-for="(manga, index) in mangas" :key="index">
          <MangaPopularSlide :manga="manga" />
        </swiper-slide>
      </swiper-container>
      <div class="absolute w-full bottom-2 left-0 pointer-events-none z-[3]">
        <div class="flex justify-end items-center gap-4 max-w-[1440px] mx-auto px-4">
          <!-- <span class="uppercase text-sm font-semibold" style="z-index: 4;">No. {{ swiper.activeIndex }}</span> -->

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