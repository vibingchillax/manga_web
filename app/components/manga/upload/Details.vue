<script setup lang="ts">
import type { Manga } from '~~/shared/types'
import { LANGUAGE_OPTIONS } from '~/utils/languages'

const props = defineProps<{
  manga: Manga
  formLocked: boolean
}>()

const oneshot = defineModel<boolean>('oneshot', { default: false })
const volNumber = defineModel<string>('volNumber', { default: '' })
const chNumber = defineModel<string>('chNumber', { default: '' })
const tlLang = defineModel<string>('tlLang', { default: '' })
const chName = defineModel<string>('chName', { default: '' })
</script>
<template>
  <h4 class="my-4 font-medium">Title</h4>
  <div class="grid grid-cols-6 gap-2">
    <div class="col-span-6">
      <MangaCard :manga="props.manga" dense overview noLink />
    </div>
    <USeparator class="my-4 col-span-6" />
    <UCheckbox v-model="oneshot" size="xl" label="This is a Oneshot"
      class="col-span-6" :disabled="formLocked" />
    <UInput v-model="volNumber" size="xl" placeholder="Volume Number"
      class="col-span-6 sm:col-span-3 md:col-span-2" :disabled="formLocked || oneshot" />
    <UInput v-model="chNumber" size="xl" placeholder="Chapter Number"
      class="col-span-6 sm:col-span-3 md:col-span-2" :disabled="formLocked || oneshot" />
    <USelect v-model="tlLang" size="xl" :items="LANGUAGE_OPTIONS.ENGLISH_FIRST.WITHOUT_SCRIPTS"
      placeholder="Translation Language" class="col-span-6 md:col-span-2" :required="true"
      :disabled="formLocked">
      <template #item-label="{ item }">
        <div class="flex flex-row items-center gap-2">
          <LangFlag :lang="item.value" />
          {{ item.label }}
        </div>
      </template>
    </USelect>
    <UInput v-model="chName" size="xl" placeholder="Chapter Name" class="col-span-6"
      :disabled="formLocked || oneshot" />
  </div>
</template>