<script setup lang="ts">
import type { Cover, Manga } from "~~/shared/types";

const props = defineProps<{
  manga: Manga;
}>();

const manga = props.manga;

const { $mangadex } = useNuxtApp();

const selectedLocales = ref([manga.attributes?.originalLanguage ?? "??"]);
const allCovers = ref<Cover[]>([]);
const foundLocales = ref<string[]>([]);

const filteredByLocale = computed(() => {
  return selectedLocales.value.length > 0
    ? allCovers.value.filter((c) =>
        selectedLocales.value.includes(c.attributes?.locale ?? "??"),
      )
    : allCovers.value;
});

const covers = computed(() => {
  if (filteredByLocale.value.length === 0) return [];

  const sorted = filteredByLocale.value
    .sort(
      (a, b) =>
        parseFloat(a.attributes?.volume ?? "0") -
        parseFloat(b.attributes?.volume ?? "0"),
    )
    .map((c) => ({
      file: c.attributes?.fileName,
      volume: c.attributes?.volume,
    }));

  if (sorted.length > 1 && sorted.some((c) => !c.volume)) {
    sorted.splice(
      sorted.findIndex((c) => !c.volume),
      1,
    );
  }

  return sorted;
});

const availableLocales = computed(() => {
  if (foundLocales.value.length > 0) {
    return LANGUAGE_OPTIONS.ALPHABETICAL.WITHOUT_SCRIPTS.filter((lang) =>
      foundLocales.value.includes(lang.value),
    );
  }
  return [...LANGUAGE_OPTIONS.ALPHABETICAL.WITHOUT_SCRIPTS];
});

const { pending, error } = useAsyncData(async () => {
  if (!manga.id) return;
  const result = await $mangadex("/cover", {
    query: {
      "order[volume]": "asc",
      "manga[]": [manga.id as string],
      limit: 100,
      offset: 0,
    } as any,
  });

  if (result.total! > 100) {
    const next = await $mangadex("/cover", {
      query: {
        "order[volume]": "asc",
        "manga[]": [manga.id as string],
        limit: 100,
        offset: 100,
      } as any,
    });

    result.data?.push(...(next.data ?? []));
  }
  const data = result.data as Cover[];
  allCovers.value = data;
  foundLocales.value = data
    .filter((c) => c.attributes?.locale)
    .map((c) => c.attributes?.locale ?? "??");
});
</script>
<template>
  <div v-if="!pending && covers?.length === 0">
    <ProseWarning>No covers</ProseWarning>
  </div>
  <div v-else>
    <div class="font-bold mb-6">Covers</div>
    <div v-if="pending">Loading...</div>
    <div v-else>
      <div class="mb-4">
        <div class="font-medium mb-1">Cover locale</div>
        <USelect
          v-model="selectedLocales"
          :items="availableLocales"
          placeholder="Any locale"
          multiple
          :ui="{ content: 'min-w-fit' }"
          class="w-48"
        >
          <template #item-label="{ item }">
            <div class="flex flex-row items-center gap-2">
              <LangFlag :lang="item.value" />
              {{ item.label }}
            </div>
          </template>
        </USelect>
      </div>
      <LightboxGroup>
        <div
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2"
        >
          <MangaCover
            v-for="cover in covers"
            :key="cover.file"
            :manga="manga"
            :cover-file="
              `https://uploads.mangadex.org/covers/${manga.id}/` + cover.file
            "
            :label="cover.volume ? `Volume ${cover.volume}` : 'No volume'"
            :no-title="false"
            lightbox
            :use256="false"
          />
        </div>
      </LightboxGroup>
    </div>
  </div>
</template>
