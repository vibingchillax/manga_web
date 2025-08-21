<script setup lang="ts">
const props = defineProps<{
  manga: Manga
}>();
</script>

<template>
  <div class="flex gap-6 items-start">
    <MangaDetailsOtherInfo :manga="manga" />
    <div class="flex-grow">
    </div>
  </div>
</template>

