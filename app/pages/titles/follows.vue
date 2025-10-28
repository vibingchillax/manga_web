<script setup lang="ts">
import type { MangaFollowStatus } from '~~/shared/prisma/enums';

const { loggedIn } = useAuth()
const preferences = usePreferencesStore();
const { contentRating } = storeToRefs(preferences)

const tabs = ref([
  {
    label: 'Reading',
    value: 'reading'
  },
  {
    label: 'Plan To Read',
    value: 'planToRead',
  },
  {
    label: 'Completed',
    value: 'completed',
  },
  {
    label: 'On Hold',
    value: 'onHold',
  },
  {
    label: 'Re-reading',
    value: 'rereading',
  },
  {
    label: 'Dropped',
    value: 'dropped',
  },
])

const active = ref<'dense' | 'normal' | 'coverOnly'>('coverOnly');
const activeTab = ref<'reading' | 'planToRead' | 'completed' | 'onHold' | 'rereading' | 'dropped'>('reading')

let followsList = ref<{ mangaId: string, status: MangaFollowStatus }[] | undefined>()
let mangaList = ref<{ result: string, response: string, data?: Manga[] } | undefined>()

if (loggedIn.value) {
  const { data: fList } = await useFetch('/api/user/follows/manga', {
    key: 'followsList'
  })

  followsList.value = fList.value

  const idsList = computed(() => followsList.value?.map(m => m.mangaId) ?? [])

  const { data: mList } = await useMangadex('/manga', {
    query: {
      limit: 32,
      offset: 0,
      "ids[]": idsList.value,
      "includes[]": ['cover_art'],
    },
    key: 'follows'
  })
  mangaList.value = mList.value
}


const followsMap = computed(() => {
  const map = new Map<string, MangaFollowStatus>()
  followsList.value?.forEach(f => map.set(f.mangaId, f.status))
  return map
})

const filteredManga = computed(() => {
  if (!mangaList.value?.data) return []
  const map = followsMap.value
  return mangaList.value.data.filter(manga => map.get(manga.id!) === activeTab.value)
})

</script>
<template>
  <Page title="Library" wide require-auth>
    <UTabs v-model="activeTab" :items="tabs" />
    <!-- <div class="flex my-4 items-center"> -->
    <div class="flex my-4 flex-row justify-between gap-6">
      <div class="text-lg">
        {{ filteredManga.length }} title(s)
      </div>
      <ListStyleControls v-model="active" />
    </div>
    <div>
      <div class="grid gap-2" :class="{
        'manga-card-dense': active === 'dense',
        'grid-cols-2': active === 'normal',
        'manga-card-cover-only grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3': active === 'coverOnly'
      }">
        <MangaCard v-for="(manga, index) in filteredManga" :key="manga.id" :manga="manga" 
          :dense="active === 'dense'" :coverOnly="active === 'coverOnly'"
          :use256="active !== 'coverOnly'" showFlag
        />
      </div>
    </div>
  </Page>
</template>