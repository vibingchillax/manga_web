<script setup lang="ts">

const settings = useReaderMenu()

const {
  _limitWidth,
  _limitHeight,
  _growPages,
  limitMaxWidth,
  limitMaxHeight
} = storeToRefs(settings)

const limitWidth = computed({
  get: () => _limitWidth.value,
  set: (val: boolean) => settings.setLimitWidth(val)
})

const limitHeight = computed({
  get: () => _limitHeight.value,
  set: (val: boolean) => settings.setLimitHeight(val)
})

const growPages = computed({
  get: () => _growPages.value,
  set: (val: boolean) => settings.setGrowPages(val)
})
const _limitMaxWidth = computed({
  get: () => limitMaxWidth.value,
  set: (val: boolean) => settings.setLimitMaxWidth(val)
})

const _limitMaxHeight = computed({
  get: () => limitMaxHeight.value,
  set: (val: boolean) => settings.setLimitMaxHeight(val)
})

</script>
<template>
  <UCheckbox label="Contain to width" v-model="limitWidth" />
  <UCheckbox label="Contain to height" v-model="limitHeight" />
  <UCheckbox label="Stretch small pages" v-model="growPages" :disabled="!limitHeight && !limitWidth" />

  <USeparator class="m-4" />

  <UCheckbox label="Limit max width" v-model="_limitMaxWidth" :disabled="!limitWidth" />
  <UCheckbox label="Limit max height" v-model="_limitMaxHeight" :disabled="!limitHeight" />
</template>