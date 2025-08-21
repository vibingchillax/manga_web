<script setup lang="ts">
const props = defineProps<{ manga: Manga }>()
const { related, pending, error } = await useRelatedMangas(props.manga)
</script>
<template>
  <div class="grid gap-4">
    <div class="font-bold">Related Titles</div>
    <div v-if="pending">Loading</div>
    <div v-if="error">{{ error }}</div>
    <div v-else class="min-w-0" v-for="r in related" :key="r.type">
      <div class="font-medium mb-2">{{ r.label }}</div>
      <div class="grid gap-2 grid-cols-2">
        <manga-card v-for="m in r.mangas" :key="m?.id" :manga="m!" />
      </div>
    </div>
  </div>
</template>