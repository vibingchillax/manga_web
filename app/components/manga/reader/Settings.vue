<script setup lang="ts">
const settings = useReaderSettingsStore();

const pageDisplayItems = [
  {
    label: 'Single Page',
    slot: 'singlePage' as const,
    icon: 'i-lucide-sticky-note'
  },
  {
    label: 'Double Page',
    slot: 'doublePage' as const,
    icon: 'i-lucide-book-open'
  },
  {
    label: 'Long Strip',
    slot: 'longStrip' as const
  },
  {
    label: 'Wide Strip',
    slot: 'wideStrip' as const
  }
]

const readingDirectionItems = [
  {
    label: 'Left to Right',
    slot: 'ltr' as const,
    icon: 'i-lucide-circle-arrow-right'
  },
  {
    label: 'Right to Left',
    slot: 'rtl' as const,
    icon: 'i-lucide-circle-arrow-left'
  }
]

const progressBarPositionItems = [
  {
    label: 'Bottom',
    slot: 'bottom',
    icon: 'i-lucide-chevron-down'
  },
  {
    label: 'Left',
    slot: 'left',
    icon: 'i-lucide-chevron-left'
  },
  {
    label: 'Right',
    slot: 'right',
    icon: 'i-lucide-chevron-right'
  }
]
</script>
<template>
  <UModal title="Reader Settings">
    <template #content>
      Page Display Style
      <UTabs :content="false" :items="pageDisplayItems" v-model="settings.pageDisplayStyle"/>
      Reading Direction
      <UTabs :content="false" :items="readingDirectionItems" v-model="settings.readingDirection"/>
      Progress Bar Position
      <UTabs :content="false" :items="progressBarPositionItems" v-model="settings.progressBarPosition"/>
      Progress Size
      <USlider :min="2" :max="16" :default-value="4" v-model="settings.progressBarSize"/>
    </template>
  </UModal>
</template>