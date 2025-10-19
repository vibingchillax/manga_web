<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { redirect, session } = useAuth()

const user = ref<User>()

onMounted(async () => {
  if (!session.value) {
    redirect.value = route.fullPath
    router.push('/login')
    return
  }

  const data = await $fetch(`/api/user/${session.value.id}`)
  if (data.result === 'ok') user.value = data.data
})
</script>
<template>
  <UserPage v-if="user" :user="user" />
  <ProseCaution v-else>
    User not found with id {{ route.params.userId }}
  </ProseCaution>
</template>