<script setup lang="ts">
import ChapterEntry from './ChapterEntry.vue';
const props = defineProps<{ volume: string, chapters: ScrapedChapter[], mangaTitle: string }>();

const isOpen = ref(true);
const toggle = () => {
  isOpen.value = !isOpen.value;
}
</script>
<template>
  <div class="flex flex-col mb-6">
    <div class="grid grid-cols-12 mb-2 cursor-pointer" @click="toggle">
      <div class="col-span-4" v-if="volume === 'No Volume'">{{ volume }}</div>
      <div class="col-span-4" v-else>Volume {{ volume }}</div>
      <div class="text-center col-span-4">
        Ch. {{ chapters[chapters.length - 1]?.chapterNumber }} - {{ chapters[0]?.chapterNumber }}
      </div>
      <div class="text-right col-span-4">
        <span>
          {{ chapters.length }}
        </span>
        <Icon :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'" />
      </div>
    </div>
    <Transition enter-active-class="transition-max-height duration-300 ease-out"
      leave-active-class="transition-max-height duration-300 ease-in">
      <div v-show="isOpen" class="rounded flex flex-col gap-2" style="height: auto;">
        <ChapterEntry v-for="chapter in chapters" :chapter="chapter" :mangaTitle="mangaTitle" />
      </div>
    </Transition>
  </div>
</template>