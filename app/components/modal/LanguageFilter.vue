<script setup lang="ts">
import type { CheckboxGroupItem, CheckboxGroupValue } from '@nuxt/ui';

const preferences = usePreferencesStore();
const items = ref<CheckboxGroupItem[]>([
  { label: "English", value: "en" },
  { label: "Afrikaans", value: "af" },
  { label: "Albanian", value: "sq" },
  { label: "Arabic", value: "ar" },
  { label: "Azerbaijani", value: "az" },
  { label: "Basque", value: "eu" },
  { label: "Belarusian", value: "be" },
  { label: "Bengali", value: "bn" },
  { label: "Bulgarian", value: "bg" },
  { label: "Burmese", value: "my" },
  { label: "Catalan", value: "ca" },
  { label: "Chinese (Simplified)", value: "zh-CN" },
  { label: "Chinese (Traditional)", value: "zh-TW" },
  { label: "Chuvash", value: "cv" },
  { label: "Croatian", value: "hr" },
  { label: "Czech", value: "cs" },
  { label: "Danish", value: "da" },
  { label: "Dutch", value: "nl" },
  { label: "Esperanto", value: "eo" },
  { label: "Estonian", value: "et" },
  { label: "Filipino", value: "fil" },
  { label: "Finnish", value: "fi" },
  { label: "French", value: "fr" },
  { label: "Georgian", value: "ka" },
  { label: "German", value: "de" },
  { label: "Greek", value: "el" },
  { label: "Hebrew", value: "he" },
  { label: "Hindi", value: "hi" },
  { label: "Hungarian", value: "hu" },
  { label: "Indonesian", value: "id" },
  { label: "Irish", value: "ga" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Javanese", value: "jv" },
  { label: "Kazakh", value: "kk" },
  { label: "Korean", value: "ko" },
  { label: "Latin", value: "la" },
  { label: "Lithuanian", value: "lt" },
  { label: "Malay", value: "ms" },
  { label: "Mongolian", value: "mn" },
  { label: "Nepali", value: "ne" },
  { label: "Norwegian", value: "no" },
  { label: "Persian", value: "fa" },
  { label: "Polish", value: "pl" },
  { label: "Portuguese", value: "pt" },
  { label: "Portuguese (Br)", value: "pt-BR" },
  { label: "Romanian", value: "ro" },
  { label: "Russian", value: "ru" },
  { label: "Serbian", value: "sr" },
  { label: "Slovak", value: "sk" },
  { label: "Slovenian", value: "sl" },
  { label: "Spanish", value: "es" },
  { label: "Spanish (LATAM)", value: "es-419" },
  { label: "Swedish", value: "sv" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Thai", value: "th" },
  { label: "Turkish", value: "tr" },
  { label: "Ukrainian", value: "uk" },
  { label: "Urdu", value: "ur" },
  { label: "Uzbek", value: "uz" },
  { label: "Vietnamese", value: "vi" }
])

const selectedLangs = computed<string[]>({
  get: () => preferences.filteredLanguages,
  set: (val: CheckboxGroupValue[]) => {
    preferences.filteredLanguages = val.filter(
      (v): v is string => typeof v === 'string'
    )
  }
})

</script>
<template>
  <UModal title="Chapter Language Filter">
    <template #body>
      <UCheckboxGroup v-model="selectedLangs" :items="items" />
    </template>
  </UModal>
</template>