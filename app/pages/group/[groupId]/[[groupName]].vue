<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const group = ref<ScanlationGroup>()
const groupId = ref(route.params.groupId as string)

const { session, loggedIn, isStaff } = useAuth()
const { leader } = useScanlationGroup(group)

const loading = ref(false)
const showDeleteModal = ref(false)

const canEdit = computed(() => loggedIn.value &&
  (session.value?.id === leader.value?.id
    || isStaff.value))

const canDelete = computed(() => loggedIn.value && isStaff.value)

async function deleteGroup() {
  try {
    const res = await $fetch(`/api/group/${groupId.value}`, {
      method: "DELETE"

    })
    showDeleteModal.value = false
    toast.add({
      description: 'Successfully deleted the group'
    })
    router.push('/groups')
  } catch {
    toast.add({
      color: 'error',
      description: 'Error while trying to delete the group...'
    })
  }
}

async function loadGroup() {
  loading.value = true
  try {
    const response = await $fetch(`/api/group/${groupId.value}`, {
      query: {
        'includes[]': ['member']
      }
    })
    group.value = response.data
  } catch {
  } finally {
    loading.value = false
  }
}

const items = ref<TabsItem[]>([
  {
    label: 'Info',
    slot: 'info' as const
  },
  {
    label: 'Feed',
    slot: 'feed' as const
  },
  {
    label: 'Titles',
    slot: 'titles' as const
  },
  {
    label: 'Members',
    slot: 'members' as const
  },
  {
    label: 'Comments',
    slot: 'comments' as const
  },
])

const {
  name
} = useScanlationGroup(group)

onMounted(() => loadGroup())
</script>
<template>
  <div v-if="loading">
    Loading...
  </div>
  <ProseCaution v-if="!group && !loading">
    Error: no group with id {{ route.params.groupId }}
  </ProseCaution>
  <PageSeparator v-else>
    <template #content>
      <div class="font-bold text-4xl my-2 md:flex items-center">
        {{ name }}
      </div>
      <div class="flex items-center gap-2 mb-6">

      </div>
      <UTabs :items="items" class="mb-6" :unmount-on-hide="false">
        <template #info="{ item }">
          <GroupDetailsInfo :group="group!" />
        </template>
        <template #feed="{ item }">
          <div>

          </div>
        </template>
        <template #titles="{ item }">
          <div>

          </div>
        </template>
        <template #members="{ item }">
          <GroupDetailsMembers :group="group!" />
        </template>
        <template #comments="{ item }">
          <div>

          </div>
        </template>
      </UTabs>
    </template>
    <template #buttons>
      <div class="flex flex-row-reverse sm:flex-col gap-2">
        <UButton v-if="canEdit" class="justify-center" variant="outline" icon="i-lucide-pencil"
          :to="`/group/edit/${groupId}`" :disabled="!group">
          Edit
        </UButton>
        <UButton v-if="canDelete" class="justify-center" variant="outline" icon="i-lucide-trash" color="error"
          @click="showDeleteModal = true" :disabled="!group">
          Delete
        </UButton>
      </div>
    </template>
    <UModal v-model:open="showDeleteModal">
      <template #body>
        Are you sure you want to delete this group?
      </template>
      <template #footer>
        <UButton variant="outline" @click="showDeleteModal = false">Cancel</UButton>
        <UButton color="error" @click="deleteGroup">Delete</UButton>
      </template>
    </UModal>
  </PageSeparator>
</template>