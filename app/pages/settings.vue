<script setup lang="ts">
const router = useRouter();
</script>
<template>
  <div class="page-container wide">
    <div class="flex items-center mb-6 mt-2">
      <UIcon
        class="custom-opacity relative md-btn flex items-center overflow-hidden accent text rounded-full !px-0 mr-4 mb-1 text-2xl cursor-pointer"
        name="i-lucide-arrow-left" @click="router.back()">
      </UIcon>
      <h2 class="font-header text-2xl font-semibold">User Settings</h2>
    </div>
    <Settings />
  </div>
</template>