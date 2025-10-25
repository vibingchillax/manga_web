<script setup lang="ts">
const { $breakpoints } = useNuxtApp()

const reader = useReaderStore()
const settings = useReaderMenu()

const { immersive } = storeToRefs(reader)
const { menuPinned } = storeToRefs(settings)
const { setMenuOpen, setMenuPinned } = settings
</script>
<template>
  <div class="flex justify-between -mx-2 -mt-2">
    <UButton
      icon="i-lucide-x"
      variant="ghost"
      size="lg"
      color="neutral"
      @click="setMenuOpen(false)"
    />

    <UButton
      v-if="$breakpoints.md.value && !immersive"
      class="ml-auto"
      :icon="menuPinned ? 'i-lucide-pin' : 'i-lucide-pin-off'"
      variant="ghost"
      size="lg"
      color="neutral"
      @click="setMenuPinned(!menuPinned)"
    />
  </div>
</template>