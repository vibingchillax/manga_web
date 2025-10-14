<script setup lang="ts">
withDefaults(defineProps<{
  is?: string
  wrap?: boolean
}>(), { is: 'div', wrap: false })
</script>
<template>
  <component v-if="wrap" :is="is" v-bind="$attrs">
    <slot v-bind="$attrs"></slot>
  </component>
  <slot v-else v-bind="$attrs"></slot>
</template>