<script setup lang="ts">
import type { Tag } from '~~/shared/types/types'

const props = defineProps<{
  tags: Tag[],
  contentRating: 'safe' | 'suggestive' | 'erotica' | 'pornographic' | undefined
}>()

const priorityOrder = ['doujinshi', 'gore', 'sexual violence']

function sortedTags(tags: Tag[]) {
  const lowerTags = tags.map(t => ({
    original: t,
    name: t.attributes?.name?.en?.toLowerCase() ?? ''
  }))

  const priorityTags: Tag[] = []
  const otherTags: Tag[] = []

  for (const tag of lowerTags) {
    if (priorityOrder.includes(tag.name)) {
      priorityTags.push(tag.original)
    } else {
      otherTags.push(tag.original)
    }
  }

  priorityTags.sort((a, b) => {
    const aIndex = priorityOrder.indexOf((a.attributes?.name?.en ?? '').toLowerCase())
    const bIndex = priorityOrder.indexOf((b.attributes?.name?.en ?? '').toLowerCase())
    return aIndex - bIndex
  })

  otherTags.sort((a, b) => {
    const aName = a.attributes?.name?.en ?? ''
    const bName = b.attributes?.name?.en ?? ''
    return aName.localeCompare(bName)
  })
  return [...priorityTags, ...otherTags]
}

const tagStyleMap: Record<string, string> = {
  gore: 'bg-status-red text-white',
  'sexual violence': 'bg-status-red text-white',
  doujinshi: 'bg-status-purple text-white',
}

const contentRatingStyleMap: Record<string, string> = {
  suggestive: 'bg-status-yellow',
  erotica: 'bg-status-red text-white',
  pornographic: 'bg-status-red text-white',
}

function tagClass(tagName: string | undefined) {
  if (!tagName) return ''
  return tagStyleMap[tagName.toLowerCase()] ?? ''
}

function contentClass(rating: string | undefined) {
  if (!rating) return ''
  return contentRatingStyleMap[rating.toLowerCase()] ?? ''
}

</script>

<template>
  <div class="flex flex-wrap gap-1 tags-row" style="max-height: calc(1em + 0rem);">
    <span v-if="contentRating !== 'safe'"
      class="inline-flex items-center gap-1 rounded uppercase text-[0.625rem] font-bold px-[0.375rem] leading-[1.5em] my-auto bg-accented"
      :class="contentClass(contentRating)">
      {{ contentRating }}
    </span>
    <template v-for="tag in sortedTags(tags)" :key="tag.id">
      <NuxtLink :to="`/tag/${tag.id}/${toKebabCase(tag.attributes?.name?.en)}`"
        class="inline-flex items-center gap-1 rounded uppercase text-[0.625rem] font-bold px-[0.375rem] leading-[1.5em] my-auto bg-accented"
        :class="tagClass(tag.attributes?.name?.en)">
        {{ tag.attributes?.name?.en }}
      </NuxtLink>
    </template>
  </div>
</template>


<style scoped>
.bg-status-yellow {
  background-color: rgb(var(--mw-status-yellow));
}

.bg-status-red {
  background-color: rgb(var(--mw-status-red));
}

.bg-status-purple {
  background-color: rgb(var(--mw-status-purple));
}
</style>
