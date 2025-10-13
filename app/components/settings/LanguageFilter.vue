<script setup lang="ts">
const preferences = usePreferencesStore();
const items = ref(LANGUAGE_OPTIONS.ENGLISH_FIRST.WITHOUT_SCRIPTS)

const selectedLangs = computed({
  get: () =>
    preferences.filteredLanguages.map(v =>
      items.value.find(i => i.value === v) ?? { label: v, value: v }
    ),
  set: (val: { label: string; value: string }[]) =>
    (preferences.filteredLanguages = val.map(v => v.value))
})

</script>
<template>
  <div id="chapter-languages" class="setting-box">
    <div class="flex justify-between">
      <div class="text-lg">
        <div>Chapter Language Filter</div>
      </div>
    </div>
    <div class="flex md:flex-row flex-col justify-between gap-4 mt-4">
      <div class="text-sm opacity-80 md:max-w-1/2">The default language the filter for chapter list is set to.
      </div>
      <UInputMenu v-model="selectedLangs" multiple :items="items">
        <template #item-label="{ item }">
          <div class="flex flex-row items-center gap-2">
            <LangFlag :lang="item.value" />
            {{ item.label }}
          </div>
        </template>
      </UInputMenu>
    </div>
  </div>
</template>