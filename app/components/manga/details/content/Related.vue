<script setup lang="ts">
const props = defineProps<{ manga: Manga }>()
const { related, pending, error } = await useRelatedMangas(props.manga)
const items = ref([
  {
    icon: 'i-lucide-list',
    value: 'dense'
  },
  {
    icon: 'i-lucide-rows-2',
    value: 'normal'
  },
  {
    icon: 'i-lucide-grid-2x2',
    value: 'coverOnly'
  }
]);
const active = ref<'dense' | 'normal' | 'coverOnly'>('coverOnly');
</script>
<template>
  <div class="grid gap-4">
    <div class="font-bold">Related Titles</div>
    <div class="flex flex-row justify-between gap-6">
      <div>
      </div>
      <UTabs v-model="active" :items="items" />
    </div>
    <div v-if="pending">Loading</div>
    <div v-if="error">{{ error }}</div>
    <div v-else class="min-w-0" v-for="r in related" :key="r.type">
      <div class="font-medium mb-2">{{ r.label }}</div>
      <div class="grid gap-2" :class="{
        'grid-cols-2': active === 'normal',
        'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3': active === 'coverOnly'
      }">
        <MangaCard v-for="m in r.mangas" :key="m?.id" :manga="m!" :dense="active === 'dense'"
          :coverOnly="active === 'coverOnly'"
        />
      </div>
    </div>
  </div>
</template>