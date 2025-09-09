<script setup lang="ts">
const router = useRouter()
defineProps({
  title: {
    type: String,
    required: true
  },
  wide: {
    type: Boolean,
    required: true
  },
  noBack: {
    type: Boolean,
    default: false
  }
})
</script>
<template>
  <div :class="['page_container', { 'wide': wide }]">
    <div v-if="!noBack" class="flex items-center mb-6 mt-2">
      <UButton class="mr-4" icon="i-lucide-arrow-left" @click="router.back()" variant="ghost" />
      <h2 class="font-header text-2xl font-semibold">{{ title }}</h2>
    </div>
    <slot></slot>
  </div>
</template>