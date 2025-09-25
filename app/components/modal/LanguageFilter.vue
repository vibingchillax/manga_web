<script setup lang="ts">
import type { CheckboxGroupValue } from '@nuxt/ui';

const preferences = usePreferencesStore();
const items = ref(LANGUAGE_OPTIONS.ENGLISH_FIRST.WITHOUT_SCRIPTS)

const selectedLangs = computed<string[]>({
  get: () => preferences.filteredLanguages,
  set: (val: CheckboxGroupValue[]) => {
    preferences.filteredLanguages = val.filter(
      (v): v is string => typeof v === 'string'
    )
  }
})

</script>
<template>
  <UModal title="Chapter Language Filter">
    <template #body>
      <UCheckboxGroup v-model="selectedLangs" :items="items" />
    </template>
  </UModal>
</template>