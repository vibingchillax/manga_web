<script setup lang="ts">
const { showMOTD } = storeToRefs(useLayout());
</script>
<template>
  <div id="motd" class="setting-box">
    <div class="flex justify-between">
      <div class="text-lg">
        <div>Message of the Day</div>
      </div>
    </div>
    <div class="flex md:flex-row flex-col justify-between gap-4 mt-4">
      <div class="text-sm opacity-80 md:max-w-1/2">
        Show message of the day on navigation bar
      </div>
      <USwitch v-model="showMOTD" class="md:max-w-1/2" />
    </div>
  </div>
</template>
