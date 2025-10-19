<script setup lang="ts">
import { NuxtLink } from '#components';

const props = defineProps<{
  group: ScanlationGroup
  noLink?: boolean
  showBlock?: boolean
  userId?: string
  showLeader?: boolean
}>()

const { avatar, name, url, leader } = useScanlationGroup(toRef(props, 'group'))

const isBlocked = ref(false) //todo

const isLeader = computed(() => {
  if (!props.userId) return false
  return leader ? props.userId === leader.value?.id : false
})
</script>
<template>
  <component :is="noLink ? 'div' : NuxtLink" :to="url" class="group-card">
    <div class="group-head">
      <!-- <NuxtImg alt="Avatar" class="group-avatar" :src="avatar" style="width: 32px; height: 32px" /> -->
      <UIcon name="i-lucide-users" style="width: 32px; height: 32px;" />
      <div class="line-clamp-1 break-all">
        {{ name }}
      </div>

      <UIcon v-if="showLeader && isLeader" name="i-lucide-crown" class="text-primary" />
    </div>
    <div v-if="showBlock && isBlocked"
      class="text-xs text-white rounded flex items-center px-1 py-0.5 bg-status-red mr-2 self-center">
      Blocked
    </div>
  </component>
</template>
<style lang="css" scoped>
.group-card {
  background: rgb(var(--mw-accent));
  border-radius: .25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  transition: background .1s ease-out
}

@media (any-hover:hover) {
  .group-card:hover {
    background: rgb(var(--mw-accent-10)) /* mw-accent-hover */
  }
}

.group-card:active {
  background: rgb(var(--mw-accent-10)) /* mw accent active */
}

.group-head {
  align-items: center;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
  display: flex;
  font-weight: 500;
  padding: .5rem
}

.group-avatar {
  border-radius: 9999px;
  border-width: 1px;
  margin-right: .5rem;
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255/var(--tw-border-opacity, 1))
}
</style>