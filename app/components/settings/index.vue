<script setup lang="ts">
import LanguageFilter from './LanguageFilter.vue';
import ContentFilter from './ContentFilter.vue';
</script>
<template>
  <div class="flex">
    <div class="button-menu"></div>
    <div class="separator"></div>
    <div class="min-w-0">
      <div class="flex flex-col gap-2">
        <LanguageFilter />
        <ContentFilter />
      </div>
    </div>
  </div>
</template>
<style lang="css">
.setting-box {
  border-bottom: 1px solid;
  border-bottom-color: currentcolor;
  border-color: rgb(var(--mw-accent-20));
  margin-top: calc(var(--navbar-height)*-1 - 16px);
  padding-bottom: 1rem;
  padding-top: calc(var(--navbar-height) + 16px);
}
</style>