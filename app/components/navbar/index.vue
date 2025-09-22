<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { HeaderStyleEnum } from '~/stores/useReaderMenu';
import Logo from './Logo.vue';
import User from './User.vue';

const route = useRoute()
const { y } = useScroll(window)
const navbarOpacity = computed(() => Math.min(y.value / 56, 1))
const isReader = computed(() => route.name?.toString().startsWith('chapter'))
const { immersive } = storeToRefs(useReaderStore())
const { headerStyle, menuPinned, menuOpen } = storeToRefs(useReaderMenu())
const { menuActive } = storeToRefs(useLayout())
</script>
<template>
  <div :class="['navbar-wrap flex flex-col',
    {
      transparent: true,
      reader: isReader,
      'header-hidden': headerStyle === HeaderStyleEnum.Hidden,
      'shown-pinned': headerStyle === HeaderStyleEnum.Shown && menuPinned,
      rmo: menuOpen,
      ma: menuActive,
    }, 'fixed top-0 right-0', {
      'max-w-[calc(100%_-_var(--drawer-menu-width))] ml-auto': menuActive
    }]">
    <div class="nav-bar-main flex justify-center">
      <div class="nav-bar flex flex-grow justify-end w-full items-center gap-2">
        <Logo v-if="!menuActive" />
        <!-- Announcement -->
        <SearchBar />
        <User />
      </div>
      <div v-if="(isReader && headerStyle === HeaderStyleEnum.Shown && !immersive) || !isReader"
        class="navbar-background" :style="{ opacity: navbarOpacity }"></div>
    </div>
  </div>
  <div v-if="(isReader && headerStyle === HeaderStyleEnum.Shown && !immersive) || !isReader"
    class="h-[var(--navbar-height)]"></div>
</template>
<style lang="css" scoped>
.navbar-wrap {
  --nav-anim-attr: .15s ease-in-out;
  transition: margin var(--nav-anim-attr), transform 75ms ease-out;
  width: 100%;
  z-index: 6;
}

.navbar-wrap:not(.transparent) {
  background-color: rgb(var(--mw-background));
}

.navbar-wrap.reader {
  left: 0;
  transition: padding-right var(--nav-anim-attr), left var(--nav-anim-attr);
  width: unset;
}

.navbar-wrap.reader.header-hidden {
  position: relative;
}

.navbar-wrap.reader.shown-pinned {
  margin-bottom: calc(var(--navbar-height)*-1);
}

.navbar-wrap.reader.rmo {
  padding-right: calc(var(--side-margin) + var(--drawer-reader-width));
}

.nav-bar-main {
  max-height: var(--navbar-height);
  min-height: var(--navbar-height);
}

.nav-bar {
  max-width: 1440px;
  padding-left: var(--side-margin);
  padding-right: var(--side-margin);
  z-index: 1;
}

.navbar-background {
  background-color: rgb(var(--mw-background));
  border-bottom: 1px solid var(--ui-primary);
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
</style>