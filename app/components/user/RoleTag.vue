<script setup lang="ts">
import type { UserRole } from "~~/shared/prisma/client";

const props = defineProps<{
  bgIndependent?: boolean;
  role?: string;
  roleList?: string[];
}>();

interface RoleStyle {
  text: string;
  color: string;
  background: string;
}

const roleMap: [UserRole, RoleStyle][] = [
  [
    "admin",
    { text: "Admin", color: "rgb(255,255,255)", background: "#9b59b6" },
  ],
  [
    "groupLeader",
    { text: "Group Leader", color: "rgb(255,255,255)", background: "#3498db" },
  ],
  [
    "user",
    { text: "User", color: "rgb(0,0,0)", background: "rgb(250, 250, 250)" },
  ],
  [
    "banned",
    { text: "Banned", color: "rgb(255,255,255)", background: "rgb(0, 0, 0)" },
  ],
];

const roleStyle = computed<RoleStyle>(() => {
  if (props.role) {
    const found = roleMap.find((s) => s[0] === props.role);
    if (found) return found[1];
  } else if (props.roleList && props.roleList.length) {
    const found = roleMap.find(([key]) => props.roleList!.includes(key));
    if (found) return found[1];
  }

  return {
    text: props.role || "Unknown",
    color: "rgb(0,0,0)",
    background: "rgb(250, 250, 250)",
  };
});
</script>

<template>
  <div
    class="role-tag"
    :class="{ independent: bgIndependent }"
    :style="{
      backgroundColor: bgIndependent ? undefined : roleStyle.background,
      color: bgIndependent ? undefined : roleStyle.color,
    }"
  >
    <div
      v-if="bgIndependent"
      class="role-dot"
      :style="{ backgroundColor: roleStyle.background }"
    />
    {{ roleStyle.text }}
  </div>
</template>
<style lang="css" scoped>
.role-tag {
  border-radius: 0.125rem;
  flex-shrink: 0;
  font-size: small;
  overflow: hidden;
  padding: 0.125rem 0.5rem;
  white-space: nowrap;
}

.role-tag.independent {
  align-items: center;
  background-color: rgb(var(--mw-accent));
  display: flex;
  font-size: revert;
  font-weight: 500;
  gap: 0.25rem;
}

.role-dot {
  border: 0.0625rem solid;
  border-radius: 9999px;
  height: 14px;
  width: 14px;
}
</style>
