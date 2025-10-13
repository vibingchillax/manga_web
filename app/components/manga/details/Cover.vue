<script setup lang="ts">
import type { Manga } from "~~/shared/types";

const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const { cover } = useManga(manga)
</script>
<template>
  <div>
    <a class="group flex items-start relative mb-auto select-none" :href="cover.coverUrl">
      <div
        class="flex opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center inset-0 absolute bg-black bg-opacity-50 pointer-events-none rounded">
        <Icon name="i-lucide-expand"></Icon>
      </div>

      <NuxtImg class="rounded shadow-md w-full h-auto" :src="cover.coverUrl512" alt="Cover Image" />
    </a>
  </div>
</template>
