<script setup lang="ts">
const route = useRoute()
const { data, pending, error } = await useFetch(`/api/user/${route.params.userId}`)
</script>
<template>
  <UserPage v-if="data?.data" :user="data.data" />
  <ProseCaution v-else>
    User not found with id {{ route.params.userId }}
  </ProseCaution>
</template>