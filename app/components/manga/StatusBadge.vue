<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    label?: string
    tag?: Tag
    link?: boolean
}>()

const styleMap: Record<string, string> = {
    suggestive: 'bg-status-yellow',
    erotica: 'bg-status-red text-white',
    pornographic: 'bg-status-red text-white',
    'sexual violence': 'bg-status-red text-white',
    doujinshi: 'bg-status-purple text-white',
}

const tagName = computed(() => {
    return props.label ?? props.tag?.attributes?.name?.en ?? ''
})

const tagClass = computed(() => {
    return styleMap[tagName.value.toLowerCase()] ?? ''
})
</script>

<template>
    <span v-if="!link || link===undefined || label" class="inline-flex items-center gap-1 rounded uppercase text-[0.625rem] 
    font-bold px-[0.375rem] leading-[1.5em] my-auto" :class="tagClass">
        {{ tagName }}
    </span>
    <a v-else :href="`/tags/${tag?.id}/${tagName.toLowerCase()}`" class="inline-flex items-center gap-1 rounded uppercase 
    text-[0.625rem] font-bold px-[0.375rem] leading-[1.5em] my-auto" :class="tagClass">
        {{ tagName }}
    </a>
</template>
