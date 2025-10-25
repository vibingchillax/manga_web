<script setup lang="ts">
import PageSelector from './PageSelector.vue';
import ChapterSelector from './ChapterSelector.vue';
import Options from './Options.vue';
import PinToggle from './PinToggle.vue';
import { HeaderStyleEnum } from '~/stores/useReaderMenu';

const reader = useReaderStore()
const settings = useReaderMenu()

const { immersive, chapterMeta, currentChapter } = storeToRefs(reader)
const { setMenuOpen } = settings
const { menuOpen, menuPinned, headerStyle, showMenuButton } = storeToRefs(settings)
const { $breakpoints } = useNuxtApp()

</script>
<template>
  <div class="mw--reader-menu">
    <div class="reader--menu" :class="{
      open: menuOpen,
      pinned: !menuPinned || immersive,
      'header-hidden': headerStyle === HeaderStyleEnum.Hidden
    }">
      <div v-if="showMenuButton && $breakpoints.md.value && !immersive" class="reader--menu-tab"
        @click="setMenuOpen(true)">
        <UIcon name="i-lucide-menu" />
      </div>
      <PinToggle />
      <div class="flex flex-col gap-y-2 mb-2 md:mb-4">
        <div class="flex">
          <Icon name="i-lucide-sticky-note"></Icon>
          {{ chapterMeta.mangaTitle }}
        </div>
        <div class="flex items-center break-words">
          <Icon name="i-lucide-book-open"></Icon>
          {{ chapterMeta.chapterTitle }}
        </div>
      </div>
      <PageSelector />
      <ChapterSelector />
      <hr class="border-1 border-accent-20 !my-2 md:!my-4">
      <div class="flex flex-col gap-y-2">
        <div class="font-medium">Uploaded By</div>
        <div class="flex items-center">
          <UIcon name="i-lucide-globe" />{{ currentChapter?.attributes.sourceId }}
        </div>
        <div class="flex items-center" v-if="chapterMeta.chapterGroups">
          <UIcon name="i-lucide-users" />{{chapterMeta.chapterGroups.map(g => g.attributes.name).join(", ")}}
        </div>
        <div class="flex items-center" v-if="chapterMeta.chapterUploader">
          <UIcon name="i-lucide-user" /> {{ chapterMeta.chapterUploader }}
        </div>
      </div>
      <hr class="border-1 border-accent-20 !my-2 md:!my-4">
      <Options />
    </div>
  </div>
  <div id="reader-menu-attach"></div>
</template>
<style lang="css" scoped>
.mw--reader-menu {
  grid-area: menu;
}

.reader--menu {
  align-self: flex-start;
  background-color: rgb(var(--mw-background));
  border-left: 1px solid rgb(var(--mw-accent));
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: calc(var(--drawer-reader-width)*-1);
  max-height: 100vh;
  max-width: var(--drawer-reader-width);
  min-width: var(--drawer-reader-min-width);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 1rem;
  position: fixed;
  right: 0;
  row-gap: .5rem;
  top: 0;
  transition: all .15s ease-in-out;
  width: 100%;
  z-index: 10;
}

@media (min-width: 48rem) {
  .reader--menu {
    box-shadow: none;
    min-width: var(--drawer-reader-width);
    position: sticky;
    right: unset;
    width: unset;
  }
}

.reader--menu.pinned {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 11;
}

.reader--menu.open {
  margin-right: 0;
}

.reader--menu.open.pinned {
  box-shadow: 0 0 30px -5px #0003;
}

.reader--menu-tab {
  border-color: #fff #fff transparent transparent;
  border-style: solid;
  border-width: 3rem;
  cursor: pointer;
  opacity: .3;
  position: fixed;
  right: 0;
  top: 0;
  transition: opacity .15s ease-out
}

.reader--menu-tab:hover {
  opacity: 1
}

.reader--menu-tab>* {
  left: 1.25rem;
  position: absolute;
  top: -1.25rem;
  transform: translate(-50%, -50%);
  --tw-text-opacity: 1;
  color: rgb(0 0 0/var(--tw-text-opacity, 1))
}
</style>