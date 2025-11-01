<script setup lang="ts">
const router = useRouter()
const reader = useReaderStore()
const pageManager = useReaderPageManager()
const settings = useReaderMenu()

const { $breakpoints } = useNuxtApp()

const {
  currentPageGroup,
  chapterState,
  immersive,
  immersionBreak,
  scrolling,
  chapterMeta,
  atTop,
  shouldShowMobileReader
} = storeToRefs(reader)

const { toggleMenuOpen } = settings

const { viewStyle, navbarHoverMode } = storeToRefs(settings)
const toggleImmersive = () => {
  reader.toggleImmersive()
}

// Random widths for skeleton loaders
const skeletonWidth1 = 50 + Math.round(Math.random() * 30) + '%'
const skeletonWidth2 = 30 + Math.round(Math.random() * 20) + '%'

const showHeader = computed(
  () => (!immersive.value || shouldShowMobileReader.value) &&
    (!navbarHoverMode.value || !$breakpoints.md.value)
)
const hideHeader = computed(() => chapterState.value !== "loaded" ? false : !immersionBreak && (!atTop || viewStyle.value !== ViewStyleEnum.LongStrip))

const { pages, pageItems } = storeToRefs(pageManager)
</script>

<template>
  <div v-if="showHeader" :class="[
    'reader--header',
    {
      hide: hideHeader && chapterState === 'loaded',
      mobile: shouldShowMobileReader,
      ls: viewStyle === ViewStyleEnum.LongStrip
    },
    'mw--reader-header'
  ]">
    <UButton v-if="shouldShowMobileReader" class="-ml-2 mr-2"
      :icon="immersive ? 'i-lucide-minimize' : 'i-lucide-expand'" size="sm"
      @click="toggleImmersive" variant="ghost" color="neutral" />
    <div class="flex-grow">
      <div v-if="chapterMeta.chapterTitle" class="reader--header-title">
        {{ reader.chapterMeta.chapterTitle }}
      </div>
      <USkeleton v-else-if="chapterState !== 'pgonly'" :class="['rounded', 'h-6 mb-1']"
        :style="{ width: skeletonWidth1 }" />
      <NuxtLink v-if="chapterMeta.mangaLink || chapterState === 'pgonly'" class="reader--header-manga"
        :to="chapterMeta.mangaLink">{{ chapterMeta.mangaTitle }}</NuxtLink>
      <USkeleton v-else class="h-5 mb-1 rounded" :style="{ width: skeletonWidth2 }" />
    </div>
    <UButton v-if="shouldShowMobileReader" class="ml-auto -mr-2"
      icon="i-lucide-menu" size="sm" @click="toggleMenuOpen" variant="ghost" color="neutral" />
    <div class="reader--header-meta">
      <div v-if="chapterMeta.chapterIdentifier" class="reader--meta chapter">
        {{ chapterMeta.chapterIdentifier }}
      </div>
      <div v-else class="reader--meta chapter"></div>
      <div v-if="chapterState === 'waiting'" class="reader--meta page"></div>
      <div v-else-if="chapterState === 'loaded' && pageItems.length > 0" class="reader--meta page">
        Pg. {{ pageItems[currentPageGroup]?.text ?? '?' }} / {{ pages.length ?? '?' }}
      </div>
      <div v-else class="reader--meta page">No Pages</div>
      <div class="reader--meta menu" @click="settings.toggleMenuOpen()">
        Menu
        <Icon name="i-lucide-chevron-left" />
      </div>
    </div>
    <div class="reader--header-groups">
      <div class="flex items-center">
        <Icon name="i-lucide-users" />
        <div class="flex items-center space-x-1">
          <NuxtLink class="group-tag" v-if="reader.chapterMeta.chapterGroups">
            {{ reader.chapterMeta.chapterGroups.map(g => g.attributes.name).join(", ") }} ({{ reader.currentChapter?.attributes.sourceId }})
          </NuxtLink>
          <NuxtLink class="group-tag" v-else>{{ reader.currentChapter?.attributes.sourceId }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.reader--header {
  border-bottom: 1px solid rgb(var(--mw-accent));
  padding: 1rem;
  position: relative;
}

.reader--header.mobile {
  align-items: center;
  background-color: rgb(var(--mw-background));
  display: flex;
  padding: .5rem 1rem;
  position: fixed;
  top: 0;
  transition: all 75ms ease-in-out;
  width: 100%;
  z-index: 10
}

.reader--header.mobile>.reader--header-groups,
.reader--header.mobile>.reader--header-meta {
  display: none
}

.reader--header.mobile>div>.reader--header-title {
  font-size: .875rem;
  line-height: 1.25rem
}

.reader--header.mobile>div>.reader--header-manga,
.reader--header.mobile>div>.reader--header-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-align: left;
  word-break: break-all
}

.reader--header.mobile>div>.reader--header-manga {
  font-size: 1rem;
  line-height: 1.5rem
}

.reader--header.mobile>div {
  display: flex;
  flex-direction: column-reverse
}

.reader--header.mobile.hide {
  transform: translateY(-100%)
}

.reader--header.mobile.hide:before {
  transform: translateY(100%)
}

.reader--header-menu-icon {
  padding: .5rem
}

.mw--reader-header {
  grid-area: header;
}

.reader--header-title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  overflow-wrap: break-word;
  text-align: center;
  word-break: break-word;
}

@media (min-width: 40rem) {
  .reader--header-title {
    text-align: left;
  }
}

.reader--header-manga {
  color: var(--ui-primary);
  display: block;
  overflow-wrap: break-word;
  text-align: center;
  word-break: break-word;
}

@media (min-width: 40rem) {
  .reader--header-manga {
    display: inline;
    text-align: left;
  }
}

.reader--header-meta {
  grid-template-columns: repeat(3, 4fr);
}

.reader--header-meta {
  -moz-column-gap: .5rem;
  column-gap: .5rem;
  display: grid;
  margin-bottom: .5rem;
  margin-top: .5rem;
}

.reader--meta {
  align-items: center;
  background-color: rgb(var(--mw-accent));
  border-radius: .125rem;
  display: flex;
  justify-content: center;
  min-width: 0;
  padding: .125rem .25rem;
  white-space: nowrap;
}

.reader--meta.menu {
  cursor: pointer;
}

.reader--meta.menu:hover {
  background-color: rgb(var(--mw-accent-10));
}

.group-tag {
  display: -webkit-box;
  overflow: hidden;
  transition: background-color 75ms ease-in-out;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  border-radius: .25rem;
  word-break: break-all;
}

.group-tag,
.group-tag.none {
  padding-left: .25rem;
  padding-right: .25rem;
}
</style>