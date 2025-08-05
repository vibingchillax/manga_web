<script setup lang="ts">
import type { SourceChaptersOutput } from '@manga_web/sources';

const props = defineProps<{
  chapters: SourceChaptersOutput
}>();
const chapters = props.chapters;
</script>
<template>
  <UTable :data="chapters"></UTable>
</template>