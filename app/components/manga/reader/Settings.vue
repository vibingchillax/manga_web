<script setup lang="ts">

const settings = useReaderSettingsStore();

const pageDisplayItems = [
  {
    label: 'Single Page',
    value: 'singlePage',
    icon: 'i-lucide-sticky-note'
  },
  {
    label: 'Double Page',
    value: 'doublePage',
    icon: 'i-lucide-book-open'
  },
  {
    label: 'Long Strip',
    value: 'longStrip'
  },
  {
    label: 'Wide Strip',
    value: 'wideStrip'
  }
]

const readingDirectionItems = [
  {
    label: 'Left to Right',
    value: 'ltr',
    icon: 'i-lucide-circle-arrow-right'
  },
  {
    label: 'Right to Left',
    value: 'rtl',
    icon: 'i-lucide-circle-arrow-left'
  }
]

const progressBarStyleItems = [
  {
    label: 'Normal',
    value: 'normal',
  },
  {
    label: 'Hidden',
    value: 'hidden',
  }
]

const progressBarPositionItems = [
  {
    label: 'Bottom',
    value: 'bottom',
    icon: 'i-lucide-chevron-down'
  },
  {
    label: 'Left',
    value: 'left',
    icon: 'i-lucide-chevron-left'
  },
  {
    label: 'Right',
    value: 'right',
    icon: 'i-lucide-chevron-right'
  }
]
</script>
<template>
  <UModal title="Reader Settings">
    <template #body>
      Page Display Style
      <UTabs v-model="settings.pageDisplayStyle" :content="false" :items="pageDisplayItems"/>
      Reading Direction
      <UTabs v-model="settings.readingDirection" :content="false" :items="readingDirectionItems"/>
      Progress Bar Style
      <UTabs v-model="settings.progressBarStyle" :content="false" :items="progressBarStyleItems"/>
      Progress Bar Position
      <UTabs v-model="settings.progressBarPosition" :content="false" :items="progressBarPositionItems"/>
      Progress Size
      <USlider :min="2" :max="16" v-model="settings.progressBarSize" tooltip />
    </template>
  </UModal>
</template>