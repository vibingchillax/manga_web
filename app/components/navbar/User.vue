<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import LanguageFilter from '../modal/LanguageFilter.vue';

const overlay = useOverlay();
const toast = useToast();
const chapterFilterModal = overlay.create(LanguageFilter);

const { session, logout } = useAuth()

const items = computed<DropdownMenuItem[][]>(() => {
  const common: DropdownMenuItem[] = [
    {
      label: 'Settings',
      icon: 'i-lucide-cog',
      to: '/settings'
    },
    {
      label: 'Chapter Languages',
      icon: 'i-lucide-book-a',
      onSelect() {
        chapterFilterModal.open()
      }
    },
    {
      label: 'Content Filter',
      icon: 'i-lucide-funnel',
      to: { path: '/settings', hash: '#content-filter' }
    }
  ]
  
  const userProfile: DropdownMenuItem[] = session.value?.isAuthenticated ? [
    {
      label: session.value.user?.username ?? session.value.user?.email,
      avatar: {
        icon: 'i-lucide-user'
      },
      to: {
        path: '/user/me'
      }
    }
  ] : [{
    label: 'Guest',
    avatar: {
      icon: 'i-lucide-user'
    },
    to: {
      path: '/login'
    }
  }]

  const authItems: DropdownMenuItem[] = session.value?.isAuthenticated
    ? [
      {
        label: 'Log out',
        color: 'error',
        icon: 'i-lucide-log-out',
        onSelect() {
          logout()
          toast.add({
            description: 'Signed out successfully',
            color: 'primary'
          }) 
        }
      }
    ]
    : [
      {
        label: 'Log in',
        icon: 'i-lucide-log-in',
        color: 'primary',
        to: '/login'
      },
      {
        label: 'Register',
        icon: 'i-lucide-user-round-plus',
        to: '/register'
      }
    ]

  return [userProfile, common, authItems]
})
</script>
<template>
  <UDropdownMenu :items="items">
    <UButton class="ml-2 md:ml-4 cursor-pointer bg-accent rounded-full flex items-center justify-center"
      icon="i-lucide-user" style="min-width: 40px; min-height: 40px;" />
  </UDropdownMenu>
</template>