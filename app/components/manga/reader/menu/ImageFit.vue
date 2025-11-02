<script setup lang="ts">
const settings = useReaderMenu();

const { _limitWidth, _limitHeight, _growPages, limitMaxWidth, limitMaxHeight } =
  storeToRefs(settings);

const limitWidth = computed({
  get: () => _limitWidth.value,
  set: (val: boolean) => settings.setLimitWidth(val),
});

const limitHeight = computed({
  get: () => _limitHeight.value,
  set: (val: boolean) => settings.setLimitHeight(val),
});

const growPages = computed({
  get: () => _growPages.value,
  set: (val: boolean) => settings.setGrowPages(val),
});
const _limitMaxWidth = computed({
  get: () => limitMaxWidth.value,
  set: (val: boolean) => settings.setLimitMaxWidth(val),
});

const _limitMaxHeight = computed({
  get: () => limitMaxHeight.value,
  set: (val: boolean) => settings.setLimitMaxHeight(val),
});
</script>
<template>
  <UCheckbox v-model="limitWidth" label="Contain to width" />
  <UCheckbox v-model="limitHeight" label="Contain to height" />
  <UCheckbox
    v-model="growPages"
    label="Stretch small pages"
    :disabled="!limitHeight && !limitWidth"
  />

  <USeparator class="m-4" />

  <UCheckbox
    v-model="_limitMaxWidth"
    label="Limit max width"
    :disabled="!limitWidth"
  />
  <UCheckbox
    v-model="_limitMaxHeight"
    label="Limit max height"
    :disabled="!limitHeight"
  />
</template>
