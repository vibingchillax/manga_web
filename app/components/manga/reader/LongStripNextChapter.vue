<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const reader = storeToRefs(useReaderStore());
const settings = storeToRefs(useReaderMenu());

const { goAdjacentChapter } = useAdjacentChapterNav();

const isLoaded = computed(() => reader.chapterState.value === "loaded");
const isLongStrip = computed(
  () => settings.viewStyle.value === ViewStyleEnum.LongStrip,
);
const showNextButton = computed(() => isLoaded.value && isLongStrip.value);

const nextChapterLink = computed(() =>
  reader.chapterMeta.value.nextChapter
    ? `/chapter/scraped/${reader.chapterMeta.value.nextChapter.id}`
    : reader.chapterMeta.value.mangaLink,
);

const goToManga = async () => {
  await router.push(reader.chapterMeta.value.mangaLink);
};

const goNextChapter = async () => {
  if (!reader.chapterMeta.value.nextChapter) {
    await goToManga();
    return;
  }
  await goAdjacentChapter();
};
</script>

<template>
  <div v-if="showNextButton" style="grid-area: next">
    <UButton
      v-if="isLongStrip"
      class="!rounded-none justify-center"
      :style="{ 'z-index': '1', 'min-height': '3rem', 'min-width': '100%' }"
      :href="nextChapterLink"
      :disabled="!reader.adjacentPopulated"
      @click.prevent="goNextChapter"
    >
      {{
        reader.chapterMeta.value.nextChapter || !reader.adjacentPopulated.value
          ? "Next Chapter"
          : "Return to Title"
      }}
    </UButton>
  </div>
</template>
