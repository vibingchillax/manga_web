<script setup lang="ts">
const props = defineProps<{
  color?: 'primary' | 'secondary' | 'warning' | 'error'
  content?: boolean
  href?: string
  lift?: boolean
  icon?: string
  noWrapper?: boolean
  small?: boolean
}>()

const classes = computed(() => [
  'tag',
  props.lift && 'lift',
  props.small && 'small',
  props.content && 'content',
  !props.icon && props.color && 'dot',
  props.noWrapper && 'no-wrapper'
].filter(Boolean))

</script>
<template>
  <!-- no idea why they separate href and to? -->
  <NuxtLink v-if="href" :class="classes" :href="href" target="_blank" rel="noopener noreferer">
    <!-- <Icon
      v-if="icon"
      :icon="icon"
      :color="color"
      small
      :x-small="content"
    />
    <Icon
      v-else-if="color"
      icon="circleMedium"
      :color="color"
    /> -->
    <UIcon v-if="icon" :name="icon" size="sm" :class="color" />
    <!-- <UIcon v-else-if="color" name="i-lucide-circle" :class="color" /> -->
    <UChip v-else-if="color" standalone inset :color="color" />
    <span v-if="$slots.default">
      <slot></slot>
    </span>
  </NuxtLink>
  <span v-else :class="classes">
    <UIcon v-if="icon" :name="icon" size="sm" :class="color" />
    <!-- <UIcon v-else-if="color" name="i-lucide-circle" :class="color" /> -->
    <UChip v-else-if="color" standalone inset :color="color" class="pr-1"/>
    <span v-if="$slots.default">
      <slot></slot>
    </span>
  </span>
</template>
<style lang="css" scoped>
.tag {
  align-items: center;
  border-radius: .25rem;
  display: inline-flex;
  font-size: .75rem;
  min-height: 1.75rem;
  padding: .3125rem .5rem;
  transition: all .1s ease-out
}

.tag.small {
  font-size: .75rem;
  line-height: 1rem;
  min-height: 1.25rem;
  padding: .15625rem .25rem
}

.tag.content {
  font-size: .625rem;
  font-weight: 700;
  margin-bottom: auto;
  margin-top: auto;
  min-height: 0;
  padding: 0 .375rem;
  text-transform: uppercase;
  vertical-align: center
}

.tag:not(.no-wrapper) {
  background-color: rgb(var(--mw-accent))
}

.tag.no-wrapper {
  border-radius: 0;
  margin-bottom: -.3125rem;
  margin-top: -.3125rem;
  padding: 0
}

.tag.lift {
  background-color: rgb(var(--mw-accent-10))
}

a.tag:hover {
  background-color: var(--ui-primary);
  --tw-text-opacity: 1;
  color: rgb(255 255 255/var(--tw-text-opacity, 1))
}

.tag svg:not(:last-child) {
  margin-right: .5rem
}

.tag.dot:not(.no-wrapper) {
  padding-left: .25rem
}

.tag.dot svg {
  margin: -.3125rem -.125rem -.3125rem -.25rem
}

.tag.dot.content svg,
.tag.dot.small svg {
  margin: -.5rem -.25rem -.5rem -.5rem
}
</style>