<script setup lang="ts">
import type { Chapter, SourceChaptersOutput } from '@manga_web/sources';
import type { TableRow } from '@nuxt/ui';

const router = useRouter();

const props = defineProps<{
  chapters: SourceChaptersOutput
}>();
const chapters = props.chapters;
function selectChapter(row: TableRow<Chapter>) {
  router.push({ path: '/chapter/crawled', query: { chapter: JSON.stringify(row.original) } })
}
</script>
<template>
  <UTable :data="chapters" @select="selectChapter"></UTable>
</template>