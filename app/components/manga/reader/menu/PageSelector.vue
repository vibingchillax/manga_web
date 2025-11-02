<script setup lang="ts">
const reader = useReaderStore();
const pageManager = useReaderPageManager();
const router = useRouter();

const { setCurrentPageGroup, incrementPageGroup } = reader;
const { currentPageGroup, chapterState } = storeToRefs(reader);

const { pageItems, pageState } = storeToRefs(pageManager);

const pageOptions = computed(() =>
  pageItems.value.map((item) => ({
    label: item.text,
    value: item.value,
    section: "Page",
  })),
);
</script>
<template>
  <div class="flex">
    <template v-if="pageState === 'loaded'">
      <UButton
        icon="i-lucide-chevron-left"
        :disabled="pageOptions.length === 0"
        @click="() => incrementPageGroup(-1, router)"
      />
      <USelect
        v-model="currentPageGroup"
        :items="pageOptions"
        @update:model-value="(val) => setCurrentPageGroup(val)"
      />
      <UButton
        icon="i-lucide-chevron-right"
        :disabled="pageOptions.length === 0"
        @click="() => incrementPageGroup(1, router)"
      />
    </template>
    <template v-else>
      <USkeleton class="rounded w-8 h-14" />
      <USkeleton class="rounded mx-2 flex-grow h-14" />
      <USkeleton class="rounded w-8 h-14" />
    </template>
  </div>
</template>
