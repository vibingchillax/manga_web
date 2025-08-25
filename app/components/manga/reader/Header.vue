<script setup lang="ts">
const route = useRoute();
const store = useScrapedReaderStore();

const title = route.params.title as string;
const titlePage = store.titleEntry ? `/title/${store.titleEntry?.id}/${toKebabCase(useMangaTitle(store.titleEntry))}` : undefined;

const chapter = computed(() => store.currentChapter!); //if header is rendered then chapter exist
const currentPage = computed(() => store.currentPage);
const totalPages = computed(() => store.totalPages);

const emit = defineEmits<{ (e: 'toggle-menu'): void }>();

function toggleMenu() {
  emit('toggle-menu');
}
</script>

<template>
  <div class="reader--header hide mw--reader-header">
    <div class="flex-grow">
      <div class="reader--header-title">
        <template v-if="chapter.title">
          {{ chapter.title }}
        </template>
        <template v-else>
          Chapter {{ chapter.chapterNumber }}
        </template>
      </div>
      <NuxtLink class="reader--header-manga" :to="titlePage">{{ title }}</NuxtLink>
    </div>
    <div class="reader--header-meta">
      <div class="reader--meta chapter">
        <template v-if="chapter.volume">
          Vol. {{ chapter.volume }}, Ch. {{ chapter.chapterNumber }}
        </template>
        <template v-else>
          Ch. {{ chapter.chapterNumber }}
        </template>
      </div>
      <div class="reader--meta page">
        Pg. {{ currentPage + 1 }} / {{ totalPages }}
      </div>
      <div class="reader--meta menu" @click="toggleMenu">
        Menu
        <Icon name="i-lucide-chevron-left" />
      </div>
    </div>
    <div class="reader--header-groups">
      <div class="flex items-center">
        <Icon name="i-lucide-users" />
        <div class="flex items-center space-x-1">
          <NuxtLink class="group-tag" v-if="chapter.scanlationGroup">{{ chapter.scanlationGroup }} ({{ chapter.sourceId
            }})
          </NuxtLink>
          <NuxtLink class="group-tag" v-else>{{ chapter.sourceId }}</NuxtLink>
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