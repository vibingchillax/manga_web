<script setup lang="ts">
const layout = useLayout()
</script>
<template>
  <div class="flex min-w-fit mr-auto">
    <UButton class="mr-2" icon="i-lucide-text-align-start" @click="layout.setMenu(true)" variant="ghost" />
    <NuxtLink to="/">
      <!-- weird temp logo plz put logo-->
      <USkeleton class="h-9 w-40 flex justify-center items-center">manga_web</USkeleton>
    </NuxtLink>
  </div>
</template>