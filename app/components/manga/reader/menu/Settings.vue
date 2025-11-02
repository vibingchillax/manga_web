<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import PageLayout from "./PageLayout.vue";
import Behaviors from "./Behaviors.vue";
import ImageFit from "./ImageFit.vue";

const props = defineProps<{
  initialTab?: "pageLayout" | "imageFit" | "behaviors";
}>();

const items: TabsItem[] = [
  {
    label: "Page Layout",
    value: "pageLayout",
  },
  {
    label: "Image fit",
    value: "imageFit",
  },
  {
    label: "Behaviors",
    value: "behaviors",
  },
];

const active = ref<"pageLayout" | "imageFit" | "behaviors">(
  props.initialTab || "pageLayout",
);
</script>
<template>
  <UModal title="Reader Settings" close :ui="{ content: 'settings__modal' }">
    <template #body>
      <div>
        <div class="flex md:flex-row flex-col gap-4 min-h-[300px]">
          <div
            class="flex md:flex-col overflow-auto gap-2 items-center"
            style="min-width: 144px"
          >
            <UTabs
              v-model="active"
              :items="items"
              orientation="vertical"
              :unmount-on-hide="false"
            />
          </div>
          <!-- <USeparator orientation="vertical" /> -->
          <div class="flex-shrink-0 w-px bg-muted" />

          <div class="flex-grow" style="min-height: 300px">
            <div v-show="active === 'pageLayout'">
              <PageLayout />
            </div>
            <div v-show="active === 'imageFit'">
              <ImageFit />
            </div>
            <div v-show="active === 'behaviors'">
              <Behaviors />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
<style lang="css">
.settings__modal {
  max-width: 800px;
  max-height: calc(100% - 3rem);
}
</style>
