<script setup lang="ts">
import { useDebounce } from '@vueuse/core'
import type { MangaList } from '~/shared/types/types'
const { $mangadex } = useNuxtApp()
const router = useRouter()
const focus = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const debouncedQuery = useDebounce(query, 500)

const results = ref<MangaList>()
const loading = ref(false)
const error = ref<string>('')

defineShortcuts({
  meta_k: () => {
    inputRef.value?.focus()
  }
})

function onSubmit() {
  if (!query.value.trim()) return
  router.push({ path: '/search', query: { q: query.value.trim() } })
}

function unfocus() {
  focus.value = false
  inputRef.value?.blur()
}

watch(debouncedQuery, async (val) => {
  if (!val) {
    results.value = undefined
    return
  }
  loading.value = true
  try {
    results.value = await $mangadex('/manga', {
      query: {
        title: val,
        "includes[]": ['cover_art'],
        'order[followedCount]': 'desc',
        'order[relevance]': 'desc',
        limit: 5
      } as any,
    })
  } catch (e) {
    error.value = e as string
    useToast().add({
      title: 'Error',
      description: error.value,
      color: "error"
    })
  }
  loading.value = false
})

watch(() => useRoute().fullPath, () => {
  unfocus()
})
</script>

<template>
  <div class="flex justify-end lg:transition-[flex-grow] lg:max-w-[50rem]" :class="focus ? 'flex-grow' : 'flex-shrink'">
    <div class="nav-bar-search flex flex-grow w-full" :class="focus ? 'active' : ''" style="z-index: 12;">
      <form class="mw-inputwrap" :class="focus ? '' : 'mw-blur'" action="/search" method="GET"
        @submit.prevent="onSubmit">
        <input ref="inputRef" id="header-search-input" class="placeholder-current" placeholder="Search" title="Search"
          name="q" autocomplete="off" v-model="query" @focus="focus = true" />
        <div class="mw-border"></div>
        <!-- <div class="mw-search-icon">
          <Icon name="i-lucide-search" />
        </div> -->
        <!-- <div class="mw-search-hint"> -->
        <!-- <UKbd key="meta" /> -->
        <!-- <UKbd key="K" /> -->
        <!-- </div> -->
        <div class="nav-bar-search__results" v-if="focus">
          <div v-if="!query">
            Enter a search query...
          </div>
          <div v-else class="-mt-4">
            <div v-if="!loading">
              <NuxtLink class="flex items-center my-4" :href="`/titles?q=${query}`">
                <div class="font-bold text-xl flex-grow">Manga</div>
                <Icon name="i-lucide-arrow-right"></Icon>
              </NuxtLink>
              <div class="grid gap-2">
                <MangaCardDense v-for="manga in results?.data?.slice(0, 6)" :manga="manga" :key="manga.id"
                  @click="unfocus()">
                </MangaCardDense>
              </div>
            </div>
            <div v-else>
              <!-- temp loading -->
              Loading...
            </div>
          </div>
        </div>
      </form>
      <div class="nav-bar-search__shade" @click="unfocus()"></div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.nav-bar-search {
  --nav-search-anim-attr: .1s ease-out;
  max-width: 32px;
  min-width: 32px;
  position: relative;
}

@media (min-width: 48rem) {
  .nav-bar-search {
    max-width: 300px;
    min-width: 200px;
    transition: max-width var(--nav-search-anim-attr), min-width var(--nav-search-anim-attr);
  }
}

.nav-bar-search.active,
.nav-bar-search:focus-within {
  max-width: calc(100% - var(--side-margin)*2);
  position: absolute;
  top: calc((var(--navbar-height) - 32px)/2);
}

@media (min-width: 48rem) {

  .nav-bar-search.active,
  .nav-bar-search:focus-within {
    max-width: 100%;
    position: relative;
    top: 0;
  }
}

.mw-inputwrap {
  border-radius: .5rem;
  box-sizing: border-box;
  color: inherit;
  margin-bottom: auto;
  margin-top: auto;
  position: relative;
  width: 100%;
  z-index: 12;
}

.mw-inputwrap input {
  padding: .25rem;
}

@media (min-width: 40rem) {
  .mw-inputwrap input {
    padding: .25rem 1rem;
  }
}

.mw-inputwrap input {
  background: none;
  border-radius: inherit;
  position: relative;
  width: 100%;
  z-index: 12;
}

#header-search-input {
  color: transparent;
}

@media (min-width: 48rem) {
  #header-search-input {
    color: currentColor;
  }
}

.mw-inputwrap .mw-border {
  border-radius: inherit;
  height: 100%;
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0;
  transition: all var(--nav-search-anim-attr);
  width: 100%;
}

@media (min-width: 48rem) {
  .mw-inputwrap {
    transition: all var(--nav-search-anim-attr);
  }
}

@supports ((-webkit-backdrop-filter:blur(10px)) or (backdrop-filter:blur(10px))) {
  .mw-inputwrap.mw-blur {
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
}

.mw-close-icon,
.mw-search-icon {
  align-items: center;
  border-radius: .25rem;
  display: flex;
  justify-content: center;
}

@media (min-width: 48rem) {

  .mw-close-icon,
  .mw-search-icon {
    height: 1.5rem;
    right: .5rem;
    top: .25rem;
    width: 1.5rem;
  }
}

.mw-close-icon,
.mw-search-icon {
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  width: 2rem;
}

.mw-search-hint {
  gap: .25rem;
  opacity: .75;
  position: absolute;
  right: 2.5rem;
  top: .375em;
  transition: opacity var(--nav-search-anim-attr);
}

@media (min-width: 48rem) {
  .mw-search-hint {
    display: flex;
  }
}

.mw-search-hint {
  display: none;
}

.nav-bar-search__results {
  background-color: rgb(var(--mw-background));
  border-bottom-left-radius: .5rem;
  border-bottom-right-radius: .5rem;
  left: 0;
  max-height: 0;
  overscroll-behavior: none;
  padding-left: 1rem;
  padding-right: 1rem;
  position: fixed;
  top: var(--navbar-height);
  width: 100%;
}

@media (min-width: 48rem) {
  .nav-bar-search__results {
    border-radius: .5rem;
    position: absolute;
    top: calc(100% + .25rem);
    transition: max-height var(--nav-search-anim-attr), padding-top var(--nav-search-anim-attr), padding-bottom var(--nav-search-anim-attr);
  }
}

.nav-bar-search__results {
  overflow: hidden;
  overflow-y: hidden;
}

.active .mw-inputwrap .nav-bar-search__results,
.mw-inputwrap:focus-within .nav-bar-search__results {
  display: block;
  max-height: calc(100vh - var(--navbar-height));
  padding-top: 1rem;
}

@media (min-width: 48rem) {

  .active .mw-inputwrap .nav-bar-search__results,
  .mw-inputwrap:focus-within .nav-bar-search__results {
    max-height: 90vh;
    padding-bottom: 1rem;
  }
}

.active .mw-inputwrap .nav-bar-search__results,
.mw-inputwrap:focus-within .nav-bar-search__results {
  overflow-y: auto;
}

.nav-bar-search__shade {
  background: #0006;
  height: 0;
  left: 0;
  opacity: 0;
  position: fixed;
  right: 0;
  top: var(--navbar-height);
  transition: opacity var(--nav-search-anim-attr), height 0s .15s;
  z-index: 5;
}

@media (min-width: 48rem) {
  .nav-bar-search__shade {
    top: 0;
  }
}

.nav-bar-search.active .nav-bar-search__shade,
.nav-bar-search:focus-within .nav-bar-search__shade {
  height: 100%;
  opacity: 1;
  transition: opacity var(--nav-search-anim-attr), height 0s;
}
</style>