<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>
<template>
  <UButton
    :label="message"
    class="flex-grow drop-shadow relative flex justify-center items-center px-3 overflow-hidden"
  />
</template>
