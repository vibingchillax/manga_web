<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import Covers from "./Covers.vue";
import Comments from "./Comments.vue";
import type { Manga, Relationship } from "~~/shared/types";
import ScrapedChapters from "./ScrapedChapters.vue";
import UploadedChapters from "./UploadedChapters.vue";
import Related from "./Related.vue";

const props = defineProps<{
  manga: Manga;
}>();

const hasRelated = computed(() =>
  (props.manga.relationships ?? []).some(
    (r: Relationship) => r.type === "manga",
  ),
);

const items = computed<TabsItem[]>(() => [
  {
    label: "Uploaded Chapters",
    slot: "uploaded_chapters",
  },
  {
    label: "Scraped Chapters",
    slot: "scraped_chapters",
  },
  {
    label: "Comments",
    slot: "comments",
  },
  {
    label: "Art",
    slot: "covers",
  },
  ...(hasRelated.value
    ? [
        {
          label: "Related",
          slot: "related",
        },
      ]
    : []),
]);
</script>
<template>
  <u-tabs :items="items" :unmount-on-hide="false">
    <template #uploaded_chapters="{ item }">
      <UploadedChapters :manga="manga" />
    </template>
    <template #scraped_chapters="{ item }">
      <ScrapedChapters :manga="manga" />
    </template>
    <template #comments="{ item }">
      <Comments :manga="manga" />
    </template>
    <template #covers="{ item }">
      <Covers :manga="manga" />
    </template>
    <template #related="{ item }">
      <Related :manga="manga" />
    </template>
  </u-tabs>
</template>
