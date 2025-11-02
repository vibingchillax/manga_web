<script setup lang="ts">
import { NuxtLink } from "#components";

defineProps<{
  large?: boolean;
  to?: string;
  showFilteredOut?: boolean;
}>();
</script>
<template>
  <component
    :is="to ? NuxtLink : 'span'"
    :to="to"
    :class="[
      'inline-flex items-center gap-1 rounded uppercase text-[0.625rem] font-bold px-[0.375rem] leading-[1.5em] my-auto',
      {
        'text-[0.85rem] py-[0.2125rem] px-[0.51rem]': large,
        '!bg-accent !text-status-red': showFilteredOut,
      },
    ]"
  >
    <UIcon
      v-if="showFilteredOut"
      name="i-lucide-x"
      class="filter-icon text-status-red"
    />
    <slot />
  </component>
</template>
