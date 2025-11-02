<script setup lang="ts">
import type { User } from "~~/shared/types";
const props = defineProps<{ user: User; noLink?: boolean }>();

const { username, roles, pageLink } = useUser(toRef(props, "user"));
</script>
<template>
  <NuxtLink class="user-card" :to="noLink ? undefined : pageLink">
    <div class="user-head">
      <slot name="prepend" />
      <!-- <NuxtImg class="user-avatar" alt="Avatar" :src="undefined"
        style="width: 32px; height: 32px;" /> -->
      <UIcon name="i-lucide-user" style="width: 32px; height: 32px" />
      <div class="line-clamp-1 break-all" :title="username">{{ username }}</div>
      <div class="ml-auto pl-1">
        <UserRoleTag :role-list="roles" />
      </div>
    </div>
    <slot name="append" />
  </NuxtLink>
</template>
<style lang="css" scoped>
.user-card {
  background: rgb(var(--mw-accent));
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  transition: background 0.1s ease-out;
}

@media (any-hover: hover) {
  .user-card:hover {
    background: rgb(var(--mw-accent-10)); /* hover */
  }
}

.user-card:active {
  background: rgb(var(--mw-accent-10)); /* active */
}

.user-head {
  align-items: center;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  display: flex;
  font-weight: 500;
  padding: 0.5rem;
}

.user-avatar {
  border-radius: 9999px;
  border-width: 1px;
  margin-right: 0.5rem;
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity, 1));
}
</style>
