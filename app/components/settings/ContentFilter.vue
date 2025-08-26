<script setup lang="ts">
import type { CheckboxGroupItem, CheckboxGroupValue } from '@nuxt/ui';

const prefs = usePreferencesStore();

const items = ref<CheckboxGroupItem[]>([
  {
    label: 'Safe',
    value: 'safe'
  },
  {
    label: 'Suggestive',
    value: 'suggestive'
  },
  {
    label: 'Erotica',
    value: 'erotica'
  },
  {
    label: 'Pornographic',
    value: 'pornographic'
  }
]);

const DEFAULT_SELECTION: CheckboxGroupValue[] = ['safe', 'suggestive', 'erotica'];

const model = computed<CheckboxGroupValue[]>({
  get: () => {
    const ratings = prefs.contentRating;
    return ratings.length ? ratings : DEFAULT_SELECTION;
  },
  set: (newVals: CheckboxGroupValue[]) => {
    const finalVals = newVals.length ? newVals : DEFAULT_SELECTION;

    prefs.showSafe = finalVals.includes('safe');
    prefs.showSuggestive = finalVals.includes('suggestive');
    prefs.showErotic = finalVals.includes('erotica');
    prefs.showHentai = finalVals.includes('pornographic');
  },
});
</script>

<template>
  <div id="content-filter" class="setting-box">
    <div class="flex justify-between">
      <div class="text-lg">
        <div>Content Filter</div>
      </div>
    </div>
    <div class="flex md:flex-row flex-col justify-between gap-4 mt-4">
      <div class="text-sm opacity-80 md:max-w-1/2"> Choose how this site displays explicit material.
      </div>
      <UCheckboxGroup class="md:max-w-1/2" v-model="model" :items="items" />
    </div>
  </div>
</template>