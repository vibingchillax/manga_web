<script setup lang="ts">
const props = defineProps<{
  manga: Manga
}>()
const router = useRouter()

function close() {
  router.push(`/title/${props.manga.id}`)
}
</script>
<template>
  <UModal title="Chapter added to approval queue" @after:leave="close">
    <template #body>
      As you have not had a chapter approved before, this chapter has been added to the approval queue.
    </template>
    <template #footer>
      <UButton color="primary" @click="$emit('close')">OK</UButton>
    </template>
  </UModal>
</template>