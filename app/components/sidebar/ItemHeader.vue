<script setup lang="ts">
defineProps<{
  title?: string
  icon: string
  link?: string
  ext?: string
  rightIcon?: string
  rightIconLink?: string
}>()

// const $breakpoints = { lg: false }
// const { setMenu } = useLayout()

</script>

<template>
  <div class="list__item">
    <div>
      <UIcon :name="icon" color="currentColor" />
    </div>

    <div class="mx-2 font-bold">{{ title }}</div>

    <NuxtLink v-if="rightIcon" :to="rightIconLink" class="ml-auto">
      <!-- @click="!$breakpoints.lg && setMenu(false)" -->
      <UIcon :name="rightIcon" color="currentColor" />
    </NuxtLink>
  </div>
</template>
<style lang="css" scoped>
.list__item {
  align-items: center;
  border-radius: 4px;
  display: flex;
  font-size: .875rem;
  height: 1.75rem;
}
</style>
