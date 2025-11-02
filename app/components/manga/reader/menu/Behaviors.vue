<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const settings = useReaderMenu();

const { doAutoAdvance } = storeToRefs(settings);

const autoAdvanceItems: TabsItem[] = [
  {
    label: "Disabled",
    value: "disabled",
  },
  {
    label: "Enabled",
    value: "enabled",
  },
];

const autoAdvance = computed({
  get: () => (doAutoAdvance.value ? "enabled" : "disabled"),
  set: (val: "enabled" | "disabled") =>
    settings.setAutoAdvance(val === "enabled"),
});
</script>
<template>
  Automatically advance chapter on last page
  <UTabs v-model="autoAdvance" :content="false" :items="autoAdvanceItems" />
</template>
