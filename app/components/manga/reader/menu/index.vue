<script setup lang="ts">
import PageSelector from './PageSelector.vue';
import ChapterSelector from './ChapterSelector.vue';
import Options from './Options.vue';

const reader = useReaderStore()
const settings = storeToRefs(useReaderMenu())

</script>
<template>
  <div class="mw--reader-menu">
    <div class="reader--menu pinned header-hidden" :class="{ open: settings.menuOpen.value }">
      <div class="flex justify-between -mx-2 -mt-2">
        <UButton icon="i-lucide-x" @click="settings.menuOpen.value = !settings.menuOpen.value" 
        variant="ghost"/>
      </div>
      <div class="flex flex-col gap-y-2 mb-2 md:mb-4">
        <div class="flex">
          <Icon name="i-lucide-sticky-note"></Icon>
          {{ reader.chapterMeta.mangaTitle }}
        </div>
        <div class="flex items-center break-words">
          <Icon name="i-lucide-book-open"></Icon>
          {{ reader.chapterMeta.chapterTitle }}
        </div>
      </div>
      <PageSelector />
      <ChapterSelector />
      <hr class="border-1 border-accent-20 !my-2 md:!my-4">
      <div class="flex flex-col gap-y-2">
        <div class="font-medium">Uploaded By</div>
        <div class="flex items-center">
          <Icon name="i-lucide-globe"></Icon> {{ reader.currentChapter?.attributes.sourceId }}
        </div>
        <div class="flex items-center" v-if="reader.chapterMeta.chapterGroups">
          <Icon name="i-lucide-users"></Icon> {{ reader.chapterMeta.chapterGroups.map(g => g.attributes.name).join(", ") }}
        </div>
        <div class="flex items-center" v-if="reader.chapterMeta.chapterUploader">
          <Icon name="i-lucide-user"></Icon> {{ reader.chapterMeta.chapterUploader }}
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
</style>