<script setup lang="ts">
const router = useRouter();
</script>
<template>
  <div class="page-container wide">
    <div class="flex items-center mb-6 mt-2">
      <UButton icon="i-lucide-arrow-left" variant="ghost" @click="router.back()" />
      <h2 class="font-header text-2xl font-semibold">User Settings</h2>
    </div>
    <Settings />
  </div>
</template>