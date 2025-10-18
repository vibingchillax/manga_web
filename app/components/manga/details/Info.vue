<script setup lang="ts">
import type { Manga, Tag } from '~~/shared/types';
const props = defineProps<{
  manga: Manga
}>()
const manga = props.manga

const { contentRating, tags, publicationStatus, publicationYear } = useManga(manga)

const colorMap = {
  completed: 'secondary',
  ongoing: 'primary',
  cancelled: 'error',
  hiatus: 'warning'
} as const
</script>
<template>
  <div class="flex gap-1 flex-wrap items-center">
    <TagsRow :rows="1"> <!-- bp ? 1 : 2-->
      <MangaTag v-if="contentRating" :value="contentRating" /> 
      <MangaTag v-for="tag in sortedTags(tags)" :key="tag.id" 
        :value="tag.attributes?.name?.en!"
        :to="routeToTag(tag)"
        class="bg-accent"
      />
    </TagsRow>
    <Tag noWrapper :color="colorMap[publicationStatus ?? 'ongoing']" class="sm:font-bold uppercase">
      <template v-if="publicationYear">
        Publication: {{ publicationYear }}, {{ publicationStatus }}
      </template>
      <template v-else>
        {{ publicationStatus }}
      </template>
    </Tag>
  </div>
</template>