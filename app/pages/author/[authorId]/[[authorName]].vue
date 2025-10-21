<script setup lang="ts">
const route = useRoute()

const { data, pending, error } = await useMangadex('/author/{id}', {
  path: {
    id: route.params.authorId as string
  },
  key: `author-${route.params.authorId}`
})

const author = computed(() => data.value?.data)
</script>
<template>
  <div v-if="pending">
    Loading...
  </div>
  <ProseCaution v-if="!data && !pending">
    Error: no group with id {{ route.params.groupId }}
  </ProseCaution>
  <PageSeparator v-else>
    <template #content v-if="author">
      <div class="font-bold text-lg mt-2 mb-6">
        {{ author?.attributes?.name }}
      </div>
      <AuthorInfo :author="author" />
      <AuthorTitles :author="author" />
    </template>
  </PageSeparator>
</template>