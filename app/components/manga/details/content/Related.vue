<script setup lang="ts">
const props = defineProps<{ manga: Manga }>();
const { related, pending, error } = await useRelatedManga(props.manga);
const active = ref<"dense" | "normal" | "coverOnly">("coverOnly");
</script>
<template>
  <div class="grid gap-4">
    <div class="font-bold">Related Titles</div>
    <div class="flex flex-row justify-between gap-6">
      <div />
      <ListStyleControls v-model="active" />
    </div>
    <div v-if="pending">Loading</div>
    <div v-if="error">{{ error }}</div>
    <div v-for="r in related" v-else :key="r.type" class="min-w-0">
      <div class="font-medium mb-2">{{ r.label }}</div>
      <div
        class="grid gap-2"
        :class="{
          'manga-card-dense': active === 'dense',
          'grid-cols-2': active === 'normal',
          'manga-card-cover-only grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3':
            active === 'coverOnly',
        }"
      >
        <MangaCard v-for="m in r.manga" :key="m?.id" :manga="m!" />
      </div>
    </div>
  </div>
</template>
