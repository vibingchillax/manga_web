<script setup lang="ts">
import type { Author } from '~~/shared/types';

const { $mangadex } = useNuxtApp()

const props = defineProps<{
  author: Author
}>()

const { contentRating } = storeToRefs(usePreferencesStore())

const page = ref(1)
const pending = ref(false)
const error = ref<Error | null>(null)
const total = ref(0)

const mangaList = ref<Manga[]>([])

const fetchData = async () => {
  pending.value = true
  error.value = null
  try {
    const response = await $mangadex('/manga', {
      query: {
        limit: 32,
        offset: (page.value - 1) * 32,
        authorOrArtist: props.author.id,
        "includes[]": ['cover_art'],
        "contentRating[]": contentRating.value
      }
    })
    mangaList.value = response.data as Manga[]
    total.value = response.total ?? 1
  } catch (err) {
    error.value = err as Error
  } finally {
    pending.value = false
  }
}

const items = ref([
  {
    icon: 'i-lucide-list',
    value: 'dense'
  },
  {
    icon: 'i-lucide-rows-2',
    value: 'normal'
  },
  {
    icon: 'i-lucide-grid-2x2',
    value: 'coverOnly'
  }
]);

const active = ref<'dense' | 'normal' | 'coverOnly'>('coverOnly');

watch(page, fetchData, { immediate: true })
</script>
<template>
  <div class="mt-6">
    <template v-if="pending">
      Loading...
    </template>
    <template v-else-if="error">
      {{ error }}
    </template>
    <template v-else>
      <div class="mb-4 font-medium"> Works ({{ total }})</div>
      <div class="mb-6"><!----></div>
      <div>
        <div class="flex my-6 flex-row justify-between gap-6">
          <div>
          </div>
          <UTabs v-model="active" :items="items" />
        </div>
        <div class="grid gap-2" :class="{
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3': active === 'coverOnly'
        }">
          <MangaCard v-for="(manga, index) in mangaList" :key="manga.id" :manga="manga" :dense="active === 'dense'"
            :coverOnly="active === 'coverOnly'" :use256="active !== 'coverOnly'" showFlag />
        </div>
        <div class="flex justify-center flex-wrap gap-2 mt-6">
          <UPagination v-model:page="page" :total="total" :items-per-page="32" />
        </div>
      </div>
    </template>
  </div>
</template>