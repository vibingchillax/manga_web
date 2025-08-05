<script setup lang="ts">
import { useMangaCover } from '~/composables/relationships/useMangaCover';

const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga
const coverUrlOriginal = ""
const coverUrl = useMangaCover(manga).coverUrl512;
</script>
<template>
  <div class="" style="grid-area: art;">
    <div>
      <a class="group flex items-start relative mb-auto select-none" :href="coverUrlOriginal">
        <div
          class="flex opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center inset-0 absolute bg-black bg-opacity-50 pointer-events-none rounded">
          <Icon name="i-lucide-expand"></Icon>
        </div>

        <NuxtImg class="rounded shadow-md w-full h-auto" :src="coverUrl" alt="Cover Image" />
      </a>
    </div>
  </div>
</template>
