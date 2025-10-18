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
  <Page title="Search" wide>
    <div>
      <div v-if="loading"> Loading... </div>
      <div v-else-if="mangasList" class="grid gap-2">
        <MangaCard v-for="manga in mangasList.data" :manga="manga" dense />
      </div>
      <div v-else>
        {{ error }}
      </div>
    </div>
  </Page>
</template>