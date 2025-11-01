<script setup lang="ts">
import type { GroupSchema } from '~/components/group/form/index.vue'

const router = useRouter()
const loading = ref(false)
const toast = useToast()

async function submit(e: Partial<GroupSchema>) {
  loading.value = true
  try {
    const response = await $fetch('/api/group', {
      method: "POST",
      body: {
        ...e
      }
    })
    if (response.result === "ok") {
      loading.value = false
      toast.add({
        title: 'Group created',
        description: 'Your group has been created successfully',
        color: 'success'
      })
      router.push(`/group/${response.data.id}`)
      return
    }
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'An error occurred while creating the group',
      color: 'error'
    })
  }
  loading.value = false
}

</script>
<template>
  <Page title="Create Group" wide require-auth>
    <GroupForm ref="groupForm" :create="true" :loading="loading" @submit="submit">
    </GroupForm>
  </Page>
</template>