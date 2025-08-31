<script setup lang="ts">
import { viewStyles, cursorHints as ch } from '~/stores/useReaderMenu';

const settings = useReaderMenu()

const {
  viewStyle,
  longStripMargin,
  readStyle,
  progressMode,
  progressSide,
  progressHeight,
  cursorHints
} = storeToRefs(settings)

</script>
<template>
  Page Display Style
  <UTabs v-model="viewStyle" :content="false" :items="viewStyles" />
  <template v-if="viewStyle === ViewStyleEnum.LongStrip || viewStyle === ViewStyleEnum.WideStrip">
    Strip Margin
    <UInputNumber v-model="longStripMargin" />
  </template>
  Reading Direction
  <UTabs v-model="readStyle" :content="false" :items="readStyles" />
  Progress Bar Style
  <UTabs v-model="progressMode" :content="false" :items="progressModes" />
  Progress Bar Position
  <UTabs v-model="progressSide" :content="false" :items="progressSides" />
  Progress Size
  <USlider :min="2" :max="16" v-model="progressHeight" tooltip />
  Cursor Action Hints
  <UTabs v-model="cursorHints" :content="false" :items="ch" />
</template>