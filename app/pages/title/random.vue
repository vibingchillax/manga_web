<script setup lang="ts">
const router = useRouter();
const { contentRating } = storeToRefs(usePreferencesStore());
const {
  data: response,
  pending,
  error,
} = await useMangadex("/manga/random", {
  query: {
    "contentRating[]": contentRating.value,
  },
});

if (response.value?.data) {
  router.push(useManga(response.value?.data).detailsUrl.value);
}
</script>

<template>
  <div v-if="pending">Loading random manga...</div>
  <div v-else-if="error">{{ error }}</div>
</template>
