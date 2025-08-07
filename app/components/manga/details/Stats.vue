<script setup lang="ts">
import type { Manga } from '~/shared/types/types';
const props = defineProps<{
  manga: Manga
}>()
</script>
<template>
  <div class="sm:mx-2 mt-auto sm:mt-0" style="grid-area: stats;"></div>
</template>