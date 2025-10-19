<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const props = defineProps<{
  user: User
}>()

const groups = ref<ScanlationGroup[]>([])

async function loadGroups() {
  if (!props.user.groups) return
  try {
    const data = await $fetch<{data: ScanlationGroup[]}>(`/api/group`, {
      query: {
        limit: 24,
        'ids[]': props.user.groups,
      }
    })

    groups.value = data.data
  } catch {

  }
}

const items = ref<TabsItem[]>([
  {
    label: 'Info',
    slot: 'info' as const
  },
  {
    label: 'Uploads',
    slot: 'uploads' as const
  },
  {
    label: 'Lists',
    slot: 'lists' as const
  }
])

onMounted(() => loadGroups())
</script>
<template>
  <PageSeparator>
    <template #content>
      <div class="font-bold text-4xl my-2 md:flex items-center">
        {{ user.username }}
      </div>
      <div class="flex items-center gap-2 mb-6">

      </div>
      <UTabs :items="items" class="mb-6" :unmount-on-hide="false">
        <template #info="{ item }">
          <div>
            <div class="mb-6">
              <dt class="mb-2 font-bold">User ID</dt>
              <dd>{{ user.id }}</dd>
            </div>
            <div class="mb-6">
              <dt class="mb-2 font-bold">Roles</dt>
              <dd class="flex gap-2 my-2 flex-wrap">
                <UserRoleTag v-for="role in user.roles" :role="role" bgIndependent />
              </dd>
            </div>
            <div class="mb-6" v-if="user.groups && user.groups.length">
              <dt class="mb-2 font-bold">Groups</dt>
              <div class="grid gap-y-2">
                <GroupCard v-for="group in groups" :group="group" :userId="user.id"
                  showLeader />
              </div>
            </div>
            <div class="mb-6">
              <dt class="mb-2 font-bold">Uploads</dt>
              <dd>0</dd>
            </div>
          </div>
        </template>
        <template #uploads="{ item }">
          <div>
            <ProseNote>
              No uploads
            </ProseNote>
          </div>
        </template>
        <template #lists="{ item }">
          <div>
            <ProseNote>
              No lists
            </ProseNote>
          </div>
        </template>
      </UTabs>
    </template>
  </PageSeparator>
</template>