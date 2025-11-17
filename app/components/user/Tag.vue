<script setup lang="ts">
import { UserRole } from "~~/shared/prisma/enums";
import { roleMap } from "./RoleTag.vue";
import { NuxtLink } from "#components";

const props = withDefaults(
  defineProps<{
    user?: User;
    roleBefore?: string;
    noLink?: boolean;
    lift?: boolean;
    largeIcon?: boolean;
    noIcon?: boolean;
  }>(),
  {
    roleBefore: UserRole.groupLeader,
  },
);

const { roles, pageLink, username } = useUser(toRef(props, "user"));

const roleColor = computed(() => {
  if (!roles) return;

  // ha = list of role definitions → preserve exact compiled behavior
  let list = [...roleMap];

  const startIndex = roleMap.findIndex((r) => r[0] === props.roleBefore);

  list.splice(
    startIndex + 1,
    startIndex === -1 ? 0 : roleMap.length - startIndex,
  );

  const found = list.find((r) => roles?.value?.includes(r[0]));

  return found ? found[1] : null;
});
</script>
<template>
  <div class="user-tag">
    <slot name="prepend">
      <UIcon
        v-if="!noIcon"
        :small="!largeIcon"
        :class="[{ largeIcon }, 'mr-0.5 md:mr-1']"
        name="i-lucide-user"
      />
    </slot>

    <slot>
      <component
        :is="noLink ? 'div' : NuxtLink"
        :to="pageLink"
        class="line-clamp-1 break-all px-1 rounded duration-100 pill"
        :class="{ lift }"
        :title="username"
        :style="{ color: roleColor?.background }"
      >
        {{ username }}
      </component>
    </slot>
  </div>
</template>
<style lang="css" scoped>
.user-tag {
  align-items: center;
  display: flex;
  word-break: break-all;
}
@media (min-width: 40rem) {
  .user-tag {
    overflow-wrap: normal;
    word-break: normal;
  }
}
.largeIcon {
  margin-right: 0.5rem;
}
.pill:hover {
  background-color: rgb(var(--mw-accent-10-hover));
}
.pill.lift:hover {
  background-color: rgb(var(--mw-accent-20-hover));
}
</style>
