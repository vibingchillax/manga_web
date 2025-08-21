<script setup lang="ts">
const props = defineProps<{ chapter: ScrapedChapter, mangaTitle: string }>();
const chapterUrl = `/${props.chapter.sourceId}/${encodeURIComponent(props.mangaTitle)}/${props.chapter.id}`;
const store = useScrapedReaderStore();
</script>
<template>
  <div class="bg-accent rounded-sm">
    <div>
      <div class="chapter relative">
        <div class="flex">
          <NuxtLink class="chapter-grid flex-grow" :to="chapterUrl" @click="store.setChapter(chapter)">
            <NuxtLink class="flex flex-grow items-center" style="grid-area: title;">
              {{ chapter.translatedLanguage ? chapter.translatedLanguage : 'en' }}
              <span class="chapter-link ml-2 font-bold my-auto flex items-center space-x-1 break-all">
                <span class="line-clamp-1">Ch. {{ chapter.chapterNumber }}</span>
              </span>
            </NuxtLink>
            <div class="flex items-center justify-self-start" style="grid-area: comments;">
              <Icon name="i-lucide-chat"></Icon>
              <span>N/A</span>
            </div>
            <div class="flex items-center justify-self-start" style="grid-area: groups;">
              <Icon name="i-lucide-users"></Icon>
              <div class="flex items-center space-x-1">
                <div class="line-clamp-1 break-all px-1 rounded duration-100 pill lift">
                  {{ chapter.scanlationGroup ? chapter.scanlationGroup : 'N/A' }}
                </div>
              </div>
            </div>
            <div class="flex items-center justify-self-start whitespace-nowrap" style="grid-area: views;">
              <Icon name="i-lucide-eye"></Icon>
              <span>N/A</span>
            </div>
            <div class="user-tag flex items-center justify-self-start" style="grid-area: uploader;">
              <Icon name="i-lucide-user"></Icon>
              <div class="line-clamp-1 break-all px-1 rounded duration-100 pill lift">
                {{ chapter.uploader ? chapter.uploader : chapter.sourceId }}
              </div>
            </div>
            <div class="flex items-center timestamp justify-self-start" style="grid-area: timestamp;">
              <Icon name="i-lucide-clock"></Icon>
              <time class="whitespace-nowrap">{{ chapter.date ? chapter.date : 'N/A' }}</time>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.bg-accent {
  background-color: rgb(var(--mw-accent));
}

.chapter {
  --main-background: var(--mw-background);
}

.chapter {
  transition: background-color .1s ease-out;
}

.chapter:not(.read) {
  background: linear-gradient(90deg, rgb(var(--mw-status-blue)) 0, rgb(var(--mw-status-blue)) 2px, rgb(var(--main-background)/0) 2px);
  border-radius: 2px;
}

.chapter-grid {
  -moz-column-gap: .5rem;
  column-gap: .5rem;
  cursor: pointer;
  display: grid;
  font-size: .75rem;
  line-height: 1rem;
  padding: .25rem .5rem;
  row-gap: .25rem;
}

@media (min-width: 48rem) {
  .chapter-grid {
    font-size: .875rem;
    line-height: 1.25rem;
  }
}

.chapter-grid {
  grid-template-areas:
    "title-views       "
    "group-comments    "
    "uploader-timestamp";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
}

@media (min-width: 40rem) {
  .chapter-grid {
    grid-template-areas:
      "title  timestamp views   "
      "groups uploader  comments";
    grid-template-columns: auto 124px 50px;
    grid-template-rows: auto auto;
  }
}

@media (min-width: 48rem) {
  .chapter-grid {
    grid-template-columns: auto 150px 60px;
    grid-template-rows: auto auto;
  }
}
</style>