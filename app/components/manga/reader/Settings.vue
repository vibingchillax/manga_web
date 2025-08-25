<script setup lang="ts">

const settings = useReaderSettingsStore();

const pageDisplayStyle = computed({
  get: () => settings.pageDisplayStyle,
  set: (val) => settings.setPageDisplayStyle(val)
});

const readingDirection = computed({
  get: () => settings.readingDirection,
  set: (val) => settings.setReadingDirection(val)
});

const progressBarStyle = computed({
  get: () => settings.progressBarStyle,
  set: (val) => settings.setProgressBarStyle(val)
});

const progressBarPosition = computed({
  get: () => settings.progressBarPosition,
  set: (val) => settings.setProgressBarPosition(val)
});

const progressBarSize = computed({
  get: () => settings.progressBarSize,
  set: (val) => settings.setProgressBarSize(val)
});

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
    <template #content>
      Page Display Style
      <UTabs v-model="pageDisplayStyle" :content="false" :items="pageDisplayItems"/>
      Reading Direction
      <UTabs v-model="readingDirection" :content="false" :items="readingDirectionItems"/>
      Progress Bar Style
      <UTabs v-model="progressBarStyle" :content="false" :items="progressBarStyleItems"/>
      Progress Bar Position
      <UTabs v-model="progressBarPosition" :content="false" :items="progressBarPositionItems"/>
      Progress Size
      <USlider :min="2" :max="16" v-model="progressBarSize" tooltip />
    </template>
  </UModal>
</template>