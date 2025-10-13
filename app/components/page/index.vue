<script setup lang="ts">
const router = useRouter()
const { loggedIn, redirect } = useAuth()
const route = useRoute()
defineProps<{
  title: string
  wide: boolean
  noBack?: boolean
  requireAuth?: boolean
}>()
</script>
<template>
  <div :class="['page-container', { 'wide': wide }]">
    <div v-if="!noBack" class="flex items-center mb-6 mt-2">
      <UButton class="mr-4" icon="i-lucide-arrow-left" @click="router.back()" variant="ghost" />
      <h2 class="font-header text-2xl font-semibold">{{ title }}</h2>
    </div>
    <div v-if="requireAuth && !loggedIn">
      <h2 class="text-center text-lg font-semibold mt-2 mb-4">You need to sign in to access this page.</h2>
      <div class="flex justify-center gap-4">
        <UButton label="Log in" @click="() => {
          redirect = route.fullPath
          router.push('/login')
        }"/>
        <UButton color="neutral" label="Register" @click="() => {
          redirect = route.fullPath
          router.push('/register')
        }"/>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>
<style lang="css" scoped>
.page-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 960px;
  width: 100%;
}

.page-container.wide {
  max-width: 1440px;
}
</style>