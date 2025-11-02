<script setup lang="ts">
defineProps<{
  status: "completed" | "ongoing" | "cancelled" | "hiatus";
  small?: boolean;
  content?: boolean;
}>();

const statusMap = {
  completed: "Completed",
  ongoing: "Ongoing",
  cancelled: "Cancelled",
  hiatus: "Hiatus",
};

const colorMap = {
  completed: "secondary",
  ongoing: "primary",
  cancelled: "error",
  hiatus: "warning",
} as const;
</script>
<template>
  <Tag lift :small="small" :content="content" :color="colorMap[status]">{{
    statusMap[status]
  }}</Tag>
</template>
