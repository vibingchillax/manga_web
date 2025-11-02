<script setup lang="ts">
defineProps<{
  value: string;
  to?: string;
  large?: boolean;
  showSafe?: boolean;
  showFilteredOut?: boolean;
}>();

const contentClasses: Record<string, string> = {
  safe: "bg-accent",
  suggestive: "text-white bg-status-yellow",
  erotica: "text-white bg-status-red",
  pornographic: "text-white bg-status-red",
  doujinshi: "text-white bg-status-purple",
  spinoff: "bg-accent",
  gore: "text-white bg-status-red",
  "sexual violence": "text-white bg-status-red",
};
</script>
<template>
  <MangaTagGeneric
    v-if="showSafe || value !== 'safe'"
    :class="contentClasses[value.toLowerCase()]"
    :large="large"
    :show-filtered-out="showFilteredOut"
    :to="to"
  >
    {{ value }}
  </MangaTagGeneric>
</template>
