<script setup lang="ts">
const props = defineProps<{
  manga: Manga
}>()
const synopsis = props.manga.attributes?.description?.en || ''; //TODO user preferences
</script>
<template>
  <div class="min-w-0" style="grid-area: synopsis;">
    <div class="" style="word-break: break-word;">
      <div style="max-height: 234px; height: auto;" class="overflow-hidden transition-[max-height,height]">
        <div>
          <div class="py-2 text-sm">
            <!-- <div class="md-md-container">
            </div> -->
            {{ synopsis }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>