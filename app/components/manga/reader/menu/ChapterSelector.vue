<script setup lang="ts">
import { ReadStyleEnum } from '~/stores/useReaderMenu'

const reader = useReaderStore()
const settings = useReaderMenu()

const { currentChapter, aggregate } = storeToRefs(reader)

const chaptersOptions = computed(() => {
  const agg = aggregate.value
  if (!agg) return []

  return Object.keys(agg)
    .sort((a, b) => b.localeCompare(a))
    .flatMap((volumeKey) => {
      const volume = agg[volumeKey]
      if (!volume) return []

      return Object.keys(volume.chapters)
        .sort((a, b) => b.localeCompare(a))
        .map((chapterKey) => {
          const chapter = volume.chapters[chapterKey]
          if (!chapter) return null
          const label =
            chapter.chapter && chapter.chapter !== 'none'
              ? `Chapter ${chapter.chapter}`
              : 'Oneshot'
          const isCurrent =
            volumeKey === (currentChapter.value?.volume ?? 'none') &&
            chapter.chapter === currentChapter.value?.chapter

          return {
            label,
            value: isCurrent ? currentChapter.value?.id ?? chapter.id : chapter.id,
          }
        })
        .filter((c): c is { label: string; value: string } => c !== null)
    })
})

const selectedChapterId = computed({
  get: () => currentChapter.value?.id ?? '',
  set: (id: string) => reader.switchChapter(id)
});

</script>
<template>
  <div id="chapter-selector" class="flex" v-if="reader.chapterState !== 'pgonly'"
    :class="{ 'flex-row-reverse': settings.readStyle == ReadStyleEnum.RTL }">
    <UButton v-if="reader.adjacentPopulated || reader.chapterMeta.prevChapter" icon="i-lucide-chevron-left"
      :to="reader.chapterMeta.prevChapter ? `/chapter/scraped/${reader.chapterMeta.prevChapter.id}` : reader.chapterMeta.mangaLink">
      <!-- isClickFromPrev true -->
    </UButton>
    <USelect class="mr-2 ml-2 flex-grow" v-if="aggregate" v-model="selectedChapterId" :items="chaptersOptions"
      label="Chapter">
    </USelect>
    <UButton v-if="reader.adjacentPopulated || reader.chapterMeta.nextChapter" icon="i-lucide-chevron-right"
      :to="reader.chapterMeta.nextChapter ? `/chapter/scraped/${reader.chapterMeta.nextChapter.id}` : reader.chapterMeta.mangaLink">
    </UButton>

    <!-- isClickFromPrev false -->
  </div>
</template>