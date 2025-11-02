<script setup lang="ts">
import { ReadStyleEnum } from "~/stores/useReaderMenu";

const reader = useReaderStore();
const settings = useReaderMenu();
const router = useRouter();

const { currentChapter, aggregate } = storeToRefs(reader);

const chaptersOptions = computed(() => {
  const agg = aggregate.value;
  if (!agg) return [];

  return Object.keys(agg)
    .sort((a, b) => b.localeCompare(a))
    .flatMap((volumeKey) => {
      const volume = agg[volumeKey];
      if (!volume) return [];

      return Object.keys(volume.chapters)
        .sort((a, b) => b.localeCompare(a))
        .map((chapterKey) => {
          const chapter = volume.chapters[chapterKey];
          if (!chapter) return null;
          const label =
            chapter.chapter && chapter.chapter !== "none"
              ? `Chapter ${chapter.chapter}`
              : "Oneshot";
          const isCurrent =
            volumeKey === (currentChapter.value?.attributes.volume ?? "none") &&
            chapter.chapter === currentChapter.value?.attributes.chapter;

          return {
            label,
            value: isCurrent
              ? (currentChapter.value?.id ?? chapter.id)
              : chapter.id,
          };
        })
        .filter((c): c is { label: string; value: string } => c !== null);
    });
});

const selectedChapterId = computed({
  get: () => currentChapter.value?.id ?? "",
  set: (id: string) => reader.switchChapter(id),
});
</script>
<template>
  <div
    v-if="reader.chapterState !== 'pgonly'"
    id="chapter-selector"
    class="flex"
    :class="{ 'flex-row-reverse': settings.readStyle == ReadStyleEnum.RTL }"
  >
    <UButton
      v-if="reader.adjacentPopulated || reader.chapterMeta.prevChapter"
      icon="i-lucide-chevron-left"
      @click="
        reader.chapterMeta.prevChapter
          ? reader.switchChapter(reader.chapterMeta.prevChapter.id)
          : router.push(reader.chapterMeta.mangaLink)
      "
    >
      <!-- isClickFromPrev true -->
    </UButton>
    <USelect
      v-if="aggregate"
      v-model="selectedChapterId"
      class="mr-2 ml-2 flex-grow"
      :items="chaptersOptions"
      label="Chapter"
    />
    <UButton
      v-if="reader.adjacentPopulated || reader.chapterMeta.nextChapter"
      icon="i-lucide-chevron-right"
      @click="
        reader.chapterMeta.nextChapter
          ? reader.switchChapter(reader.chapterMeta.nextChapter.id)
          : router.push(reader.chapterMeta.mangaLink)
      "
    />

    <!-- isClickFromPrev false -->
  </div>
</template>
