<script setup lang="ts">
import type { User } from '~~/shared/types';
defineProps<{ user: User, noLink: boolean }>()
</script>
<template>
  <NuxtLink class="user-card" :to="noLink ?
    undefined : `/user/${user.id}/${toKebabCase(user.username)}`">
    <div class="user-head">
      <!-- <NuxtImg class="user-avatar" alt="Avatar" :src="undefined"
        style="width: 32px; height: 32px;" /> -->
      <UIcon name="i-lucide-user" style="width: 32px; height: 32px;" />
      <div class="line-clamp-1 break-all" :title="user.username">{{ user.username }}</div>
      <div class="ml-auto pl-1">
        <div class="role-tag">
          {{ user.role }}
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
<style lang="css" scoped>
.user-card {
  background: rgb(var(--mw-accent));
  border-radius: .25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  transition: background .1s ease-out;
}

.user-head {
  align-items: center;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
  display: flex;
  font-weight: 500;
  padding: .5rem;
}

.user-avatar {
  border-radius: 9999px;
  border-width: 1px;
  margin-right: .5rem;
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255/var(--tw-border-opacity, 1));
}

.role-tag {
  border-radius: .125rem;
  flex-shrink: 0;
  font-size: small;
  overflow: hidden;
  padding: .125rem .5rem;
  white-space: nowrap;
}
</style>