<script setup lang="ts">
import type { CollectionResponse } from "~~/shared/types/common";

const router = useRouter();
const route = useRoute();
const preferences = usePreferencesStore();
const mangaList = ref<Manga[]>();
const loading = ref(false);
const error = ref<string | null>(null);
watch(
  () => route.query.q,
  async (q) => {
    if (!q) return;
    loading.value = true;
    try {
      const data = await $fetch<CollectionResponse<Manga>>("/api/manga", {
        query: {
          title: q as string,
          "includes[]": ["cover_art"],
          "contentRating[]": preferences.contentRating,
          limit: 20,
          "order[relevance]": "desc",
        },
      });
      mangaList.value = data.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    }
    loading.value = false;
  },
  { immediate: true },
);
</script>
<template>
  <Page title="Search" wide>
    <div>
      <div v-if="loading">Loading...</div>
      <div v-else-if="mangaList" class="grid gap-2">
        <MangaCard v-for="manga in mangaList" :manga="manga" dense />
      </div>
      <div v-else>
        {{ error }}
      </div>
    </div>
  </Page>
</template>
