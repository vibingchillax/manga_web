<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    lang: string;
    size?: number;
    displayScripts?: boolean;
  }>(),
  {
    size: 24,
    displayScripts: false,
  },
);

const languages = LANGUAGES_BY_CODE;

const halfSize = computed(() => Math.floor(props.size / 2));
const flag = computed(() => languages.get(props.lang) || languages.get("NULL"));
</script>
<template>
  <Wrap
    :is="'div'"
    class="select-none"
    :wrap="displayScripts"
    :style="[
      { display: 'inline-block !important' },
      { minWidth: size + 'px', minHeight: size + 'px' },
    ]"
    v-bind="$attrs"
  >
    <img
      v-if="flag"
      v-bind="$attrs"
      :class="!displayScripts && 'inline-block select-none'"
      :title="flag.name.inEnglish"
      :src="`/img/flags/${flag.display.flag}.svg`"
      :alt="`${flag.name.inEnglish} flag icon`"
      :width="size"
      :height="size"
    />

    <img
      v-if="displayScripts && flag?.display.script"
      :title="flag.name.inEnglish"
      :src="`/img/scripts/${flag.display.script}.svg`"
      :alt="`${flag.name.inEnglish} script icon`"
      :width="halfSize"
      :height="halfSize"
      style="margin-top: -12px; margin-left: auto; margin-right: -2px"
    />
  </Wrap>
</template>
