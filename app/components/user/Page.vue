<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const props = defineProps<{
  user: User;
}>();

const {
  id,
  username,
  roles,
  groups: userGroups,
} = useUser(toRef(props, "user"));

const groups = ref<ScanlationGroup[]>([]);

async function loadGroups() {
  if (!userGroups.value) return;
  try {
    const data = await $fetch<{ data: ScanlationGroup[] }>(`/api/group`, {
      query: {
        limit: 24,
        "ids[]": userGroups.value.map((g) => g.id),
      },
    });

    groups.value = data.data;
  } catch {}
}

const items = ref<TabsItem[]>([
  {
    label: "Info",
    slot: "info" as const,
  },
  {
    label: "Uploads",
    slot: "uploads" as const,
  },
  {
    label: "Lists",
    slot: "lists" as const,
  },
]);

onMounted(() => loadGroups());
</script>
<template>
  <PageSeparator>
    <template #content>
      <div class="font-bold text-4xl my-2 md:flex items-center">
        {{ username }}
      </div>
      <div class="flex items-center gap-2 mb-6" />
      <UTabs :items="items" class="mb-6" :unmount-on-hide="false">
        <template #info="{ item }">
          <div>
            <div class="mb-6">
              <dt class="mb-2 font-bold">User ID</dt>
              <dd>{{ id }}</dd>
            </div>
            <div class="mb-6">
              <dt class="mb-2 font-bold">Roles</dt>
              <dd class="flex gap-2 my-2 flex-wrap">
                <UserRoleTag
                  v-for="role in roles"
                  :role="role"
                  bg-independent
                />
              </dd>
            </div>
            <div v-if="groups && groups.length" class="mb-6">
              <dt class="mb-2 font-bold">Groups</dt>
              <div class="grid gap-y-2">
                <GroupCard
                  v-for="group in groups"
                  :group="group"
                  :user-id="user.id"
                  show-leader
                />
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
            <ProseNote> No uploads </ProseNote>
          </div>
        </template>
        <template #lists="{ item }">
          <div>
            <ProseNote> No lists </ProseNote>
          </div>
        </template>
      </UTabs>
    </template>
  </PageSeparator>
</template>
