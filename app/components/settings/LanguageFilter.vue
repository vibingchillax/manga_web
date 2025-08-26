<script setup lang="ts">
const preferences = usePreferencesStore();
const items = ref([
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

const selectedLangs = computed({
  get: () =>
    preferences.filteredLanguages.map(v =>
      items.value.find(i => i.value === v) ?? { label: v, value: v }
    ),
  set: (val: { label: string; value: string }[]) =>
    (preferences.filteredLanguages = val.map(v => v.value))
})

</script>
<template>
  <div id="chapter-languages" class="setting-box">
    <div class="flex justify-between">
      <div class="text-lg">
        <div>Chapter Language Filter</div>
      </div>
    </div>
    <div class="flex md:flex-row flex-col justify-between gap-4 mt-4">
      <div class="text-sm opacity-80 md:max-w-1/2">The default language the filter for chapter list is set to.
      </div>
      <UInputMenu v-model="selectedLangs" multiple :items="items" />
    </div>
  </div>
</template>