<script setup lang="ts">
const preferences = usePreferencesStore();
const { gatewayUrl, gatewayUrls } = storeToRefs(preferences);

function onCreate(item: string) {
  if (!gatewayUrls.value.includes(item)) {
    preferences.gatewayUrls.push(item);
  }
  gatewayUrl.value = item;
}
</script>
<template>
  <div id="motd" class="setting-box">
    <div class="flex justify-between">
      <div class="text-lg">
        <div>IPFS Gateway</div>
      </div>
    </div>
    <div class="flex md:flex-row flex-col justify-between gap-4 mt-4">
      <div class="text-sm opacity-80 md:max-w-1/2">
        Select which IPFS gateway to load images from, or use your own gateway
        by entering the URL in the search bar
      </div>
      <USelectMenu
        v-model="gatewayUrl"
        create-item
        class="w-56"
        :items="gatewayUrls"
        :ui="{ content: 'min-w-fit' }"
        @create="onCreate"
      />
    </div>
  </div>
</template>
