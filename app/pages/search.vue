<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const { $mangadex } = useNuxtApp()
const preferences = usePreferencesStore()
const mangasList = ref<MangaList>();
const loading = ref(false);
const error = ref<string | null>(null);
watch(() => route.query.q, async (q) => {
  if (!q) return;
  loading.value = true;
  try {
    mangasList.value = await $mangadex('/manga', {
      query: {
        title: q as string,
        'includes[]': ['cover_art'],
        'contentRating[]': preferences.contentRating,
        limit: 20,
        'order[relevance]': 'desc'
      } as any
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
  loading.value = false;
}, { immediate: true })

</script>
<template>
  <div class="page-container wide">
    <div class="flex items-center mb-6 mt-2">
      <Icon name="i-lucide-arrow-left" @click="router.back()" />
      <h2 class="font-header text-2xl font-semibold">Search</h2>
    </div>
    <div>
      <div v-if="loading"> Loading... </div>
      <div v-else-if="mangasList" class="grid gap-2">
        <manga-card v-for="manga in mangasList.data" :manga="manga"></manga-card>
      </div>
      <div v-else>
        {{ error }}
      </div>
    </div>
  </div>
</template>