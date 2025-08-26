<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import LanguageFilter from '../modal/LanguageFilter.vue';

const overlay = useOverlay();
const chapterFilterModal = overlay.create(LanguageFilter);

const items = ref<DropdownMenuItem[]>([
  {
    label: 'Settings',
    icon: 'i-lucide-cog',
    to: '/settings'
  },
  {
    label: 'Chapter Languages',
    icon: 'i-lucide-book-a',
    onSelect() {
      chapterFilterModal.open()
    }
  },
  {
    label: 'Content Filter',
    icon: 'i-lucide-funnel',
    to: {
      path: '/settings',
      hash: '#content-filter'
    }
  }
]);
</script>
<template>
  <UDropdownMenu :items="items">
    <UButton class="ml-2 md:ml-4 cursor-pointer bg-accent rounded-full flex items-center justify-center"
      icon="i-lucide-user" style="min-width: 40px; min-height: 40px;" />
  </UDropdownMenu>
</template>