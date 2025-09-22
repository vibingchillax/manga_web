<script setup lang="ts">
const router = useRouter()
const auth = useAuth()
const authRedirect = useAuthRedirect()
const route = useRoute()
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  wide: {
    type: Boolean,
    required: true
  },
  noBack: {
    type: Boolean,
    default: false
  },
  requireAuth: {
    type: Boolean,
    default: false
  }
})
</script>
<template>
  <div :class="['page_container', { 'wide': wide }]">
    <div v-if="!noBack" class="flex items-center mb-6 mt-2">
      <UButton class="mr-4" icon="i-lucide-arrow-left" @click="router.back()" variant="ghost" />
      <h2 class="font-header text-2xl font-semibold">{{ title }}</h2>
    </div>
    <div v-if="requireAuth && !auth.session.value?.isAuthenticated">
      <h2 class="text-center text-lg font-semibold mt-2 mb-4">You need to sign in to access this page.</h2>
      <div class="flex justify-center gap-4">
        <UButton label="Log in" @click="() => {
          authRedirect = route.fullPath
          router.push('/login')
        }"/>
        <UButton color="neutral" label="Register" @click="() => {
          authRedirect = route.fullPath
          router.push('/register')
        }"/>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>