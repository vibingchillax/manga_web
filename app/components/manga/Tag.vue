<script setup lang="ts">
const props = defineProps<{
  mode?: 'status' | 'link',
  href?: string,
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled',
  year?: number | null,
}>()
</script>

<template>
  <span v-if="mode === 'status'" class="tag" :class="[$attrs.class]">
    <span>
      <UChip v-if="status === 'ongoing'" standalone inset />
      <UChip v-else-if="status === 'completed'" color="secondary" standalone inset />
      <UChip v-else-if="status === 'hiatus'" color="warning" standalone inset />
      <UChip v-else color="error" standalone inset />
      <template v-if="year">
        Publication: {{ year }}, {{ status }}
      </template>
      <template v-else>
        {{ status }}
      </template>
    </span>
  </span>
  <NuxtLink v-else :href="href" class="tag" :class="[$attrs.class]">
    <slot></slot>
  </NuxtLink>
</template>
<style lang="css" scoped>
.tag {
  align-items: center;
  border-radius: .25rem;
  display: inline-flex;
  font-size: .75rem;
  min-height: 1.75rem;
  padding: .3125rem .5rem;
  transition: all .1s ease-out;
}

.tag.small {
  font-size: .75rem;
  line-height: 1rem;
  min-height: 1.25rem;
  padding: .15625rem .25rem;
  padding-left: 0.25rem;
}

.tag.no-wrapper {
  border-radius: 0;
  margin-bottom: -.3125rem;
  margin-top: -.3125rem;
  padding: 0;
}

.tag:not(.no-wrapper) {
  background-color: rgb(var(--mw-accent));
}

.tag.lift {
  background-color: rgb(var(--mw-accent-10));
}

.tag.dot:not(.no-wrapper) {
  padding-left: .25rem;
}
</style>