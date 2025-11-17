<script setup lang="ts">
// component stub
const props = defineProps<{
  stats: any;
  type?: string | number;
  id?: string | number;
  windowPosition?: string;
  loading?: boolean;
  hover?: boolean;
  lighten?: boolean;
  showZeroComments?: boolean;
}>();

const statId = computed(() => props.id);
const statType = computed(() => props.type);
const commentsUrl = computed(() => {
  return undefined;
});

const replies = ref<number>(0);

const showCount = computed(() => {
  const p = replies?.value ?? 0;
  return props.showZeroComments || p > 0;
});

const repliesCount = computed(() => replies?.value ?? 0);
const formattedReplies = computed(() => {
  return Number.isFinite(repliesCount.value) ? String(repliesCount.value) : "0";
});
</script>
<template>
  <NuxtLink
    :to="commentsUrl"
    :title="`View ${repliesCount} comments`"
    class="comment-container"
    target="_blank"
    :class="{ hover: hover }"
    v-bind="$attrs"
  >
    <UIcon small name="i-lucide-message-square" />
    <template v-if="loading">
      <USkeleton
        :class="['w-6 rounded', { 'bg-accent': lighten }]"
        :style="{ height: '0.9375rem' }"
      />
    </template>
    <template v-else-if="showCount">
      <span class="comment-count">{{ formattedReplies }}</span>
    </template>
  </NuxtLink>
</template>
<style lang="css" scoped>
.comment-container {
  align-items: center;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  gap: 0.25rem;
  white-space: nowrap;
}

.comment-container.hover {
  margin-bottom: -0.125rem;
  margin-left: -0.25rem;
  margin-top: -0.125rem;
  padding: 0.125rem 0.25rem;
  transition: background-color 75ms ease-in-out;
}

.comment-container.hover:hover {
  background-color: rgb(var(--mw-accent-20-hover));
}
</style>
