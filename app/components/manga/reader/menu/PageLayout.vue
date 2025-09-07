<script setup lang="ts">
import { viewStyles, cursorHints as ch, ViewStyleEnum, ReadStyleEnum, ProgressModeEnum, ProgressSideEnum, CursorHintsEnum, HeaderStyleEnum } from '~/stores/useReaderMenu';

const reader = useReaderStore()
const settings = useReaderMenu()

const {
  viewStyle,
  longStripMargin,
  readStyle,
  headerStyle,
  progressMode,
  progressSide,
  progressHeight,
  cursorHints,
  dimPages,
  dimWithDark,
  pageDim,
  backgroundColor
} = storeToRefs(settings)

const {
  greyscale
} = storeToRefs(reader)

const viewStyleStr = computed({
  get: () => String(viewStyle.value),
  set: (val: string) => settings._viewStyle = Number(val) as ViewStyleEnum
})

const _longStripMargin = computed({
  get: () => longStripMargin.value,
  set: (val: number) => settings.setLongStripMargin(val)
})

const readStyleStr = computed({
  get: () => String(readStyle.value),
  set: (val: string) => settings.readStyle = Number(val) as ReadStyleEnum
})

const headerStyleStr = computed({
  get: () => String(headerStyle.value),
  set: (val: string) => settings.headerStyle = Number(val) as HeaderStyleEnum
})

const progressModeStr = computed({
  get: () => String(progressMode.value),
  set: (val: string) => settings.setProgressMode(Number(val) as ProgressModeEnum)
})

const progressSideStr = computed({
  get: () => String(progressSide.value),
  set: (val: string) => settings.setProgressSide(Number(val) as ProgressSideEnum)
})

const cursorHintStr = computed({
  get: () => String(cursorHints.value),
  set: (val: string) => settings.setCursorHints(Number(val) as CursorHintsEnum)
})

const greyscaleModel = computed({
  get: () => greyscale.value,
  set: (val: boolean) => reader.setGreyScale(val)
})

const dimPagesModel = computed({
  get: () => dimPages.value,
  set: (val: boolean) => settings.setDimPages(val)
})

const backgroundColorModel = computed({
  get: () => backgroundColor.value === 'transparent' ? undefined : backgroundColor.value,
  set: (val: string) => {
    if (!(backgroundColor.value === 'transparent')) {
      settings.setBackgroundColor(val)
    }
  }
})

const viewStylesStr = computed(() =>
  viewStyles.map(v => ({ ...v, value: String(v.value) }))
)

const readStylesStr = computed(() =>
  readStyles.map(v => ({ ...v, value: String(v.value) }))
)

const headerStylesStr = computed(() =>
  headerStyles.map(v => ({ ...v, value: String(v.value) }))
)

const progressModesStr = computed(() =>
  progressModes.map(v => ({ ...v, value: String(v.value) }))
)

const progressSidesStr = computed(() =>
  progressSides.map(v => ({ ...v, value: String(v.value) }))
)

const cursorHintsStr = computed(() =>
  ch.map(v => ({ ...v, value: String(v.value) }))
)
//https://github.com/nuxt/ui/issues/4804
</script>
<template>
  Page Display Style
  <UTabs v-model="viewStyleStr" :content="false" :items="viewStylesStr" />
  <template v-if="viewStyle === ViewStyleEnum.LongStrip || viewStyle === ViewStyleEnum.WideStrip">
    Strip Margin
    <UInputNumber v-model="_longStripMargin" :min="0" />
  </template>
  Reading Direction
  <UTabs v-model="readStyleStr" :content="false" :items="readStylesStr" />
  Header Visibility
  <UTabs v-model="headerStyleStr" :content="false" :items="headerStylesStr" />
  Progress Bar Style
  <UTabs v-model="progressModeStr" :content="false" :items="progressModesStr" />
  Progress Bar Position
  <UTabs v-model="progressSideStr" :content="false" :items="progressSidesStr" />
  Progress Size
  <USlider :min="2" :max="16" v-model="progressHeight" tooltip />
  Cursor Action Hints
  <UTabs v-model="cursorHintStr" :content="false" :items="cursorHintsStr" />
  Reader extras
  <UCheckbox v-model="greyscaleModel" label="Greyscale pages" />
  <UCheckbox v-model="dimPagesModel" label="Dim pages" />
  <USlider :min="0" :max="1" :step="0.01" v-model="pageDim" v-show="dimPages" tooltip />
  Reader background color
  <div>
    <UColorPicker format="rgb" v-model="backgroundColorModel" />
    <UButton @click="settings.setBackgroundColor('transparent')">Transparent</UButton>
    <UButton @click="settings.setBackgroundColor('white')">White</UButton>
    <UButton @click="settings.setBackgroundColor('black')">Black</UButton>
  </div>
</template>