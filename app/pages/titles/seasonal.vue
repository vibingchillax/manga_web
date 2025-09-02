<script setup lang="ts">
const router = useRouter();
const preferences = usePreferencesStore();
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

const { data: mangasList, pending, error } = await useMangadex('/manga', {
  query: {
    limit: 32,
    offset: 0,
    "includes[]": ["cover_art"],
    "contentRating[]": preferences.contentRating,
    "ids[]": idList.value
  } as any,
})

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
</script>
<template>
  <div class="page-container wide">
    <div class="flex items-center mb-6 mt-2">
      <UButton icon="i-lucide-arrow-left" variant="ghost" @click="router.back()" />
      <h2 class="font-header text-2xl font-semibold">
        {{ seasonal }}
      </h2>
    </div>
    <div>
      <div class="flex my-6 flex-row justify-between gap-6">
        <div>
        </div>
        <UTabs v-model="active" :items="items" />
      </div>
      <div class="grid gap-2" :class="{
        'grid-cols-2': active === 'normal',
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3': active === 'coverOnly'
      }">
        <MangaCard v-for="(manga, index) in mangasList?.data" :key="manga.id" :manga="manga" :type="active">
        </MangaCard>
      </div>
    </div>
  </div>
</template>