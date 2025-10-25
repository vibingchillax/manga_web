<script setup lang="ts">
import { type Manga } from '~~/shared/types'
import ChaptersList from './ChaptersList.vue'
import type { ScrapedChapter, ScrapedManga } from '~~/shared/types'

const toast = useToast()

const props = defineProps<{
  manga: Manga
}>()

const preferences = usePreferencesStore()

const manga = props.manga
const originalTitle = useManga(manga).title.value as string
const title = ref<string>(originalTitle)

const selectedSource = ref<SourceLabel>()
const scrapedMangas = ref<ScrapedManga[]>([])
const scrapedChapters = ref<ScrapedChapter[]>([])
const selectedManga = ref<ScrapedManga>()
const hasFetched = ref(false)

const loading = ref(false)
const progressValue = ref(0)

const { data, status } = await useFetch('/api/sources')

async function scrapeFromSource() {
  if (loading.value || !selectedSource.value) return
  loading.value = true
  try {
    const mangaRes = await $fetch('/api/scrape/mangas', {
      method: 'POST',
      body: { title: title.value, sourceId: selectedSource.value.id, mangadexId: manga.id }
    })

    if (!(mangaRes.data.length)) throw new Error('Nothing found')

    scrapedMangas.value = mangaRes.data as ScrapedManga[]
    progressValue.value = 1
    selectedManga.value = scrapedMangas.value[0]
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function scrapeChapters() {
  if (!selectedManga.value) return

  loading.value = true
  progressValue.value = 1

  try {
    const chapters = await $fetch(`/api/scraped/manga/${selectedManga.value.id}/feed`)
    if (!(chapters.data.length)) throw new Error('No chapters found')

    scrapedChapters.value = chapters.data as ScrapedChapter[]
    progressValue.value = 2
    hasFetched.value = true

  } catch (error) {
    toast.add({
      title: 'Error',
      description: error instanceof Error ? error.message : String(error),
      color: 'error'
    })

  } finally {
    loading.value = false
    progressValue.value = 0
  }
}

const groupedChapters = computed(() => {
  const groups = new Map<string, ScrapedChapter[]>()
  const filteredChapters = scrapedChapters.value.filter(ch =>
    preferences.filteredLanguages.length === 0 ||
    preferences.filteredLanguages.includes(ch.attributes.translatedLanguage || 'en')
  )
  for (const ch of filteredChapters) {
    const vol = ch.attributes.volume ?? 'No Volume'
    if (!groups.has(vol)) groups.set(vol, [])
    groups.get(vol)!.push(ch)
  }

  return Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === 'No Volume') return -1
    if (b === 'No Volume') return 1

    const na = Number(a)
    const nb = Number(b)
    const aIsNum = !Number.isNaN(na)
    const bIsNum = !Number.isNaN(nb)

    if (aIsNum && bIsNum) return nb - na   // numeric DESC
    if (aIsNum) return -1                  // numeric before non-numeric
    if (bIsNum) return 1

    return a.localeCompare(b)              // fallback string sort
  })
})

watch(selectedSource, async (source) => {
  if (!source) return
  await scrapeFromSource()
})

watch(selectedManga, async (manga, old) => {
  if (!manga || manga.id === old?.id) return
  await scrapeChapters()
})
</script>
<template>
  <div class="flex gap-6 items-start">
    <div class="mt-6">
      <USelectMenu placeholder="Select reading source" :loading="status === 'pending'" v-model="selectedSource"
        :items="data" :ui="{ content: 'min-w-fit' }">
        <template #item-label="{ item }">
          {{ item.label }}
          <span class="px-4 text-muted">{{ item.url }}</span>
          <span class="px-4 text-muted">{{ item.flags }}</span>
        </template>
      </USelectMenu>
      <UModal title="Reselect manga to scrape">
        <UButton class="ml-2" variant="ghost" color="neutral" label="Incorrect match?"
          v-if="hasFetched && scrapedMangas.length && scrapedChapters.length" />
        <template #body>
          <div class="grid gap-2">
            <div v-for="manga in scrapedMangas" :key="manga.id"
              class="cursor-pointer transition-all duration-200 rounded-xl border-2 overflow-hidden" :class="[
                selectedManga?.id === manga.id
                  ? 'border-amber-400 bg-amber-50/10 shadow-inner'
                  : 'border-transparent hover:border-gray-500/50 hover:bg-gray-100/5'
              ]" @click="selectedManga = manga">
              <MangaCard :manga="toManga(manga)" dense noLink showFlag />
            </div>
          </div>
        </template>
      </UModal>
    </div>
    <div class="flex-grow mt-6">
      <UProgress v-if="loading" v-model="progressValue" :max="['Fetching mangas...', 'Fetching chapters...']" />
      <div v-if="!loading && hasFetched && scrapedChapters.length > 0">
        <ChaptersList v-for="([vol, chapters]) in groupedChapters" :key="vol" :volume="vol" :chapters="chapters" />
      </div>
    </div>
  </div>
</template>