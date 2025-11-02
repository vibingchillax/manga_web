<script setup lang="ts">
import Settings from "./Settings.vue";

const reader = useReaderStore();
const settings = useReaderMenu();
const overlay = useOverlay();

const settingsModal = overlay.create(Settings);

const { currentChapter, manga } = storeToRefs(reader);

const {
  viewStyle,
  viewStyleLabel,
  offsetDoubles,
  headerStyleLabel,
  progressModeLabel,
  readStyleLabel,
  sizeModeLabel,
} = storeToRefs(settings);

const { setOffsetDoubles, switchProgressMode, switchSizeMode, switchStyles } =
  settings;

const currentOffset = computed(() => {
  const id = manga.value?.id || "default";
  return offsetDoubles.value[id];
});

const toggleOffset = () => {
  const id = manga.value?.id || "default";
  setOffsetDoubles([id, !offsetDoubles.value[id]]);
};

function openSettingsModal(
  tab: "pageLayout" | "imageFit" | "behaviors" = "pageLayout",
) {
  settingsModal.open({ initialTab: tab });
}
</script>
<template>
  <div class="flex flex-col gap-2">
    <UButton
      class="align-start"
      :icon="viewStyleLabel?.icon"
      @click="switchStyles('viewStyle')"
    >
      {{ viewStyleLabel?.label }}
    </UButton>
    <UButton
      v-if="viewStyle === ViewStyleEnum.DoublePage"
      :color="currentOffset ? 'secondary' : 'primary'"
      @click="toggleOffset"
    >
      Offset Double Spreads</UButton
    >
    <div class="flex">
      <UButton
        class="flex-grow mr-2"
        :icon="sizeModeLabel?.icon"
        @click="switchSizeMode"
        >{{ sizeModeLabel?.name }}
      </UButton>
      <UButton icon="i-lucide-cog" @click="openSettingsModal('imageFit')" />
    </div>
    <UButton :icon="readStyleLabel?.icon" @click="switchStyles('readStyle')">
      {{ readStyleLabel?.label }}
    </UButton>
    <UButton
      :icon="headerStyleLabel?.icon"
      @click="switchStyles('headerStyle')"
    >
      {{ headerStyleLabel?.label }}
    </UButton>
    <div class="flex">
      <UButton
        class="flex-grow mr-2"
        :icon="progressModeLabel?.icon"
        @click="switchProgressMode"
        >{{ progressModeLabel?.label }}</UButton
      >
      <UButton icon="i-lucide-cog" @click="openSettingsModal('pageLayout')" />
    </div>
    <UButton icon="i-lucide-cog" @click="openSettingsModal()">
      Reader Settings
    </UButton>
  </div>
</template>
