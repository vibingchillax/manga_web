<script setup lang="ts">
const router = useRouter();
const preferences = usePreferencesStore();
const { contentRating } = storeToRefs(preferences);
const { data } = await useMangadex('/list/{id}', {
  path: {
    id: '68ab4f4e-6f01-4898-9038-c5eee066be27'
  },
  key: 'seasonal_ids'
})

const seasonal = computed(() => data.value?.data?.attributes?.name)
const idList = computed(() => data.value?.data?.relationships
  ?.filter((r): r is { id: string; type: "manga" } => r.type === "manga" && !!r.id)
  .map(r => r.id) ?? []);

const { data: mangaList, pending, error } = await useMangadex('/manga', {
  query: {
    limit: 32,
    offset: 0,
    "includes[]": ["cover_art"],
    "contentRating[]": contentRating.value,
    "ids[]": idList.value
  } as any,
  watch: [contentRating],
  key: 'seasonalPage'
})

const active = ref<'dense' | 'normal' | 'coverOnly'>('coverOnly');
</script>
<template>
  <Page :title="seasonal ?? 'Seasonal'" wide>
    <div>
      <div class="flex my-6 flex-row justify-between gap-6">
        <div>
        </div>
        <ListStyleControls v-model="active" />
      </div>
      <div class="grid gap-2" :class="{
        'manga-card-dense': active === 'dense',
        'grid-cols-2': active === 'normal',
        'manga-card-cover-only grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3': active === 'coverOnly'
      }">
        <MangaCard v-for="(manga, index) in mangaList?.data" :key="manga.id" :manga="manga"
          :use256="active !== 'coverOnly'" showFlag
        />
      </div>
    </div>
  </Page>
</template>