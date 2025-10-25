<script setup lang="ts">
const route = useRoute()

const layout = useLayout()

const { $breakpoints } = useNuxtApp()
const { menuActive } = storeToRefs(layout)
const { loggedIn } = useAuth()

const animating = ref(false)
const menuEl = ref<HTMLElement | null>(null)


const offsetLeft = () => {
  const w = menuEl.value?.getBoundingClientRect().width
  return w ? `-${w}px` : 'calc(-1 * var(--drawer-menu-width))'
}

type ItemLink = { title: string; link: string; icon?: string }
type ItemHeader = { title: string; icon: string; rightIcon?: string; rightIconLink?: string }

type MenuItem = ItemLink | ItemHeader
type Section = MenuItem[]

const sections = computed<Section[]>(() => {
  const home: Section = [
    { title: 'Home', icon: 'i-lucide-house', link: '/' }
  ]

  const follows: Section = [
    { title: 'Follows', icon: 'i-lucide-bookmark' },
    { title: 'Updates', link: '/titles/feed' },
    { title: 'Library', link: '/titles/follows' },
    { title: 'My Lists', link: '/my/lists' },
    { title: 'My Groups', link: '/my/groups' },
    { title: 'Reading History', link: '/my/history' }
  ]

  // const titlesSection: ItemHeader = session.value?.isAuthenticated
  //   ? {
  //     title: 'Titles',
  //     icon: 'i-lucide-book-open',
  //     rightIcon: 'i-lucide-plus',
  //     rightIconLink: '/titles/drafts'
  //   }
  //   : {
  //     title: 'Titles',
  //     icon: 'i-lucide-book-open'
  //   }

  const titlesSection: ItemHeader = {
    title: 'Titles',
    icon: 'i-lucide-book-open'
  }

  const titles: Section = [
    titlesSection,
    { title: 'Advanced Search', link: '/titles' },
    { title: 'Recently Added', link: '/titles/recent' },
    { title: 'Latest Updates', link: '/titles/latest' },
    { title: 'Random', link: '/title/random' }
  ]

  const communitySection: ItemHeader = {
    title: 'Community',
    icon: 'i-lucide-users',
  }

  const community: Section = [
    communitySection,
    loggedIn.value ?
      { title: 'Groups', link: '/groups', 
        rightIcon: 'i-lucide-plus', rightIconLink: '/create/group'
      } :
      { title: 'Groups', link: '/groups' },
    { title: 'Users', link: '/users' }
  ]

  return [home, follows, titles, community]
})

onMounted(() => {
  if (!$breakpoints.lg.value) layout.setMenu(false)
})

watch(() => route.name, (newName) => {
  if (newName?.toString().startsWith('chapter')) {
    layout.setMenu(false)
  }
}, { immediate: true })

watch($breakpoints.lg, async (isLg) => {
  if (isLg) {
    if (menuEl.value !== null) {
      animating.value = true
      layout.setMenu(!!menuEl.value)
      await nextTick()
      animating.value = false
    } else {
      animating.value = false
    }
  } else {
    animating.value = true
    // menuEl.value = menuActive.value
    layout.setMenu(false)
    await nextTick()
    animating.value = false
  }
})
</script>
<template>
  <div class="flex flex-col bg-accent h-screen md:h-full z-[7] lg:z-auto">
    <div v-if="!animating" v-show="menuActive" class="shade" @click="layout.setMenu(false)"></div>

    <div ref="menuEl" class="drawer" :style="{
      marginLeft: menuActive ? 0 : offsetLeft(),
      transition: animating ? 'none' : 'margin-left ease-in-out 150ms'
    }">
      <div class="lg:top-0 lg:sticky flex flex-col overflow-y-auto overscroll-contain h-screen">
        <div class="mx-4 py-2 flex-shrink-0 flex justify-between items-center">
          <NuxtLink to="/">
            <USkeleton class="h-12 w-48 flex justify-center items-center">manga_web</USkeleton>
          </NuxtLink>
          <UButton icon="i-lucide-x" class="ml-auto -mr-2" variant="ghost" @click="layout.setMenu(false)" />
        </div>
        <div v-for="section in sections" :key="section[0]?.title"
          :id="`section-${section[0]?.title.replace(/\W+/g, '_')}`" class="px-4 pt-2 flex flex-col flex-shrink-0">
          <template v-for="entry in section" :key="entry.title">
            <SidebarItemLink v-if="'link' in entry" v-bind="entry"></SidebarItemLink>
            <SidebarItemHeader v-else v-bind="entry"></SidebarItemHeader>
          </template>
        </div>
        <div class="flex-grow"></div>
        <div class="flex flex-col">
          <div class="mt-auto px-4 py-2">
            <p class="text-sm text-gray-400">yay!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.shade {
  background-color: #222;
  height: 100vh;
  left: 0;
  opacity: .46;
  position: fixed;
  top: 0;
  transition: opacity .2s ease;
  width: 100%;
}

@media (min-width: 48rem) {
  .shade {
    height: 100%;
  }
}

@media (min-width: 64rem) {
  .shade {
    display: none;
  }
}

.drawer {
  background-color: rgb(var(--mw-accent));
  box-shadow: inset -25px 0 9px -25px #0000001a;
  flex-grow: 1;
  flex-shrink: 0;
  height: 100vh;
  left: 0;
  max-width: var(--drawer-menu-width);
  min-width: 256px;
  position: fixed;
  top: 0;
  width: var(--drawer-menu-width);
}

@media (min-width: 48rem) {
  .drawer {
    height: 100%;
  }
}

@media (min-width: 64rem) {
  .drawer {
    height: auto;
    position: static;
  }
}
</style>