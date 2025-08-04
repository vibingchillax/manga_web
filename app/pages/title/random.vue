<script setup lang="ts">
const router = useRouter()

const { data, error } = await useAsyncData('random', () => getMangaRandom())

if (data.value?.data) {
  router.push(`/title/${data.value.data.id}/${toKebabCase(data.value.data.attributes?.title?.en as string)}`)
}
</script>

<template>
  <div>Loading random manga...</div>
</template>