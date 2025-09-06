<script setup lang="ts">
import { NuxtLink } from '#components';

defineProps<{
  title?: string
  icon?: string
  link?: string
  rightIcon?: string
  rightIconLink?: string
  target?: string
}>()

const route = useRoute()
const { setMenu } = useLayout()
</script>

<template>
  <NuxtLink :to="link" :target="target" class="flex-shrink-0">
    <!-- @click="!$breakpoints.lg && setMenu(false)" -->
    <div :class="[
      'list__item px-2',
      {
        '!font-bold': icon,
        'menu__item--hover-highlight': link,
        'menu__item--active-highlight': route.path === link
      }
    ]">
      <div v-if="icon">
        <UIcon :name="icon" color="currentColor" />
      </div>

      <div class="mx-2">{{ title }}</div>

      <component v-if="rightIcon" :is="rightIconLink ? NuxtLink : 'span'" :to="rightIconLink" class="ml-auto">
        <div>
          <UIcon :name="rightIcon" color="currentColor" :small="!rightIconLink" />
        </div>
      </component>
    </div>
  </NuxtLink>
</template>
<style lang="css" scoped>
.list__item {
  align-items: center;
  border-radius: 4px;
  display: flex;
  font-size: .875rem;
  height: 1.75rem;
}

.menu__item--active-highlight {
  background-color: var(--ui-primary);
  font-weight: 500;
  --tw-text-opacity: 1;
  color: rgb(255 255 255/var(--tw-text-opacity, 1));
}
</style>
