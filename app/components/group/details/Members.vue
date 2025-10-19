<script setup lang="ts">
const props = defineProps<{
  group: ScanlationGroup
}>()

const {
  members,
  leader
} = useScanlationGroup(toRef(props, 'group'))
</script>
<template>
  <div>
    <div v-if="leader" class="mb-6">
      <div class="font-bold mb-2">Group Leader</div>
      <UserCard :user="leader" />
    </div>

    <ProseNote v-if="members.length === 0">No Members</ProseNote>

    <div v-else class="mb-6">
      <div class="font-bold mb-2">Group Members</div>
      <div class="grid gap-2">
        <UserCard v-for="member in members" :key="member.id" :user="member" />
      </div>
    </div>
  </div>
</template>