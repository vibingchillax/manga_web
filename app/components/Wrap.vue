<script setup lang="ts">
withDefaults(
  defineProps<{
    is?: string;
    wrap?: boolean;
  }>(),
  { is: "div", wrap: false },
);
</script>
<template>
  <component :is="is" v-if="wrap" v-bind="$attrs">
    <slot v-bind="$attrs" />
  </component>
  <slot v-else v-bind="$attrs" />
</template>
