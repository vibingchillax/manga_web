<script setup lang="ts">
const props = defineProps<{
  manga: Manga
}>()
</script>
<template>
  <div class="sm:ml-2 relative" style="grid-area: buttons;">
    <div class="flex gap-2 sm:mb-0 mb-2 flex-wrap">
      <UModal title="Add to Library">
        <UButton label="Add to Library" />
        <template #body>
          <Placeholder class="h-48 m-4" />
        </template>
      </UModal>

      <UButton color="neutral" icon="i-lucide-upload" :to="`/title/upload/${manga.id}`"></UButton>
    </div>
  </div>
</template>