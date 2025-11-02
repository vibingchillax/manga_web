<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";

withDefaults(
  defineProps<{
    rows?: number;
  }>(),
  { rows: 3 },
);

const rowRef = useTemplateRef("rowRef");
const hasOverflow = ref(false);
const expanded = ref(false);

const checkOverflow = () => {
  if (!rowRef.value) return;
  const el = rowRef.value;
  hasOverflow.value = el.scrollHeight > el.clientHeight + 1;
};

useResizeObserver(rowRef, checkOverflow);

onMounted(() => {
  checkOverflow();
});
</script>
<template>
  <div
    ref="rowRef"
    :class="[
      'flex flex-wrap gap-1 tags-row',
      { 'overflow-y-hidden': hasOverflow && !expanded },
    ]"
    :style="{
      maxHeight: expanded
        ? 'unset'
        : `calc(${rows} * 1em + ${(rows - 1) * 0.25}rem)`,
    }"
    @click="expanded = true"
  >
    <slot />
  </div>
</template>
<style lang="css" scoped>
.tags-row.overflow-y-hidden {
  cursor: pointer;
  padding-right: 2.5rem;
  position: relative;
}

.tags-row.overflow-y-hidden:after {
  bottom: 0;
  color: var(--ui-primary);
  content: "MORE";
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1rem;
  position: absolute;
  right: 0.125rem;
}
</style>
