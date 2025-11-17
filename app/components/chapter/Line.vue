<script setup lang="ts">
const props = defineProps<{
  last?: boolean;
  unreadBelow?: boolean;
  isRead: boolean;
  compact?: boolean;
}>();

const isReadOpacity = computed(() => !props.unreadBelow && props.isRead);

const { $breakpoints } = useNuxtApp();
const { oneRowChapters: oneLine } = storeToRefs(useLayout());

const isTwoLine = computed(
  () => $breakpoints.sm.value && (!oneLine.value || props.compact),
);
</script>

<template>
  <div :class="['chapter-line', { twoLine: isTwoLine }]">
    <div
      :class="[
        'chapter-line-top',
        { last, twoLine: isTwoLine, 'opacity-40': isReadOpacity },
      ]"
    ></div>

    <div
      v-if="!last"
      :class="[
        'chapter-line-bottom',
        { twoLine: isTwoLine, 'opacity-40': isReadOpacity },
      ]"
    ></div>

    <div
      :class="[
        'chapter-line-extend',
        { twoLine: isTwoLine, 'opacity-40': isReadOpacity },
      ]"
    ></div>
  </div>
</template>
<style lang="css" scoped>
.chapter-line {
  display: flex;
  padding-bottom: 0.125rem;
  padding-left: 0.625rem;
  padding-top: 0.125rem;
}

@media (min-width: 40rem) {
  .chapter-line {
    padding-left: 0.875rem;
  }
}

.chapter-line.twoLine {
  padding-bottom: 0.25rem;
  padding-left: 0.75rem;
  padding-top: 0.25rem;
}

.chapter-line-bottom,
.chapter-line-extend,
.chapter-line-top {
  transform: translateZ(0);
}

.chapter-line-top {
  background-color: rgb(var(--mw-contrast-1));
  border-top-left-radius: 0.0625rem;
  border-top-right-radius: 0.0625rem;
  height: 0.75rem;
  width: 0.125rem;
}

.chapter-line-top.last {
  border-bottom-left-radius: 0.0625rem;
}

.chapter-line-top.twoLine {
  border-top-left-radius: 0.125rem;
  border-top-right-radius: 0.125rem;
  margin-left: 0.125rem;
  width: 0.25rem;
}

.chapter-line-top.twoLine.last {
  border-bottom-left-radius: 0.125rem;
}

.chapter-line-extend {
  background-color: rgb(var(--mw-contrast-1));
  border-bottom-right-radius: 0.0625rem;
  border-top-right-radius: 0.0625rem;
  height: 0.125rem;
  margin-top: 0.625rem;
  width: 0.5rem;
}

@media (min-width: 40rem) {
  .chapter-line-extend {
    width: 0.625rem;
  }
}

.chapter-line-extend.twoLine {
  border-bottom-right-radius: 0.125rem;
  border-top-right-radius: 0.125rem;
  height: 0.25rem;
  margin-top: 0.5rem;
}

.chapter-line-bottom {
  background-color: rgb(var(--mw-contrast-1));
  border-bottom-left-radius: 0.0625rem;
  border-bottom-right-radius: 0.0625rem;
  margin-left: -0.125rem;
  margin-top: 0.75rem;
  width: 0.125rem;
}

.chapter-line-bottom.twoLine {
  border-bottom-left-radius: 0.125rem;
  border-bottom-right-radius: 0.125rem;
  margin-left: -0.25rem;
  width: 0.25rem;
}

.chapter-line-bottom {
  height: calc(100% - 0.75rem);
}
</style>
