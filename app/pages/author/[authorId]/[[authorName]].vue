<script setup lang="ts">
const route = useRoute();

const { data, pending, error } = await useFetch<SingleResponse<Author>>(
  `/api/author/${route.params.authorId}`,
  {
    key: `author-${route.params.authorId}`,
  },
);

const author = computed(() => data.value?.data);
</script>
<template>
  <div v-if="pending">Loading...</div>
  <ProseCaution v-if="!data && !pending">
    Error: no author with id {{ route.params.authorId }}
  </ProseCaution>
  <PageSeparator v-else>
    <template v-if="author" #content>
      <div class="font-bold text-lg mt-2 mb-6">
        {{ author?.attributes?.name }}
      </div>
      <AuthorInfo :author="author" />
      <AuthorTitles :author="author" />
    </template>
  </PageSeparator>
</template>
