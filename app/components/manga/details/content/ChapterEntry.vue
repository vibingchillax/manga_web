<script setup lang="ts">
const props = defineProps<{ chapter: ScrapedChapter }>();

function isValidDate(date: Date | string | null | undefined) {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

const {
  sourceId,
  title,
  chapter,
  readUrl,
  uploader,
  translatedLanguage,
  scanlationGroup,
  publishAt,
} = useScrapedChapter(toRef(props, "chapter"));
</script>
<template>
  <div class="bg-accent rounded-sm">
    <div>
      <div class="chapter relative">
        <div class="flex">
          <NuxtLink class="chapter-grid flex-grow" :to="readUrl">
            <NuxtLink
              class="flex flex-grow items-center"
              style="grid-area: title"
            >
              <LangFlag :lang="translatedLanguage" />
              <span
                class="chapter-link ml-2 font-bold my-auto flex items-center space-x-1 break-all"
              >
                <span v-if="title === 'Oneshot'" class="line-clamp-1"
                  >Oneshot</span
                >
                <span v-else-if="title" class="line-clamp-1">
                  Ch. {{ chapter }} - {{ title }}
                </span>
                <span v-else class="line-clamp-1">Ch. {{ chapter }}</span>
              </span>
            </NuxtLink>
            <div
              class="flex items-center justify-self-start"
              style="grid-area: comments"
            >
              <Icon name="i-lucide-message-square" />
              <span>N/A</span>
            </div>
            <div
              class="flex items-center justify-self-start"
              style="grid-area: groups"
            >
              <Icon name="i-lucide-users" />
              <div class="flex items-center space-x-1">
                <div
                  class="line-clamp-1 break-all px-1 rounded duration-100 pill lift"
                >
                  {{
                    scanlationGroup?.length
                      ? scanlationGroup.map((g) => g.attributes.name).join(", ")
                      : "N/A"
                  }}
                </div>
              </div>
            </div>
            <div
              class="flex items-center justify-self-start whitespace-nowrap"
              style="grid-area: views"
            >
              <Icon name="i-lucide-eye" />
              <span>N/A</span>
            </div>
            <div
              class="user-tag flex items-center justify-self-start"
              style="grid-area: uploader"
            >
              <Icon name="i-lucide-user" />
              <div
                class="line-clamp-1 break-all px-1 rounded duration-100 pill lift"
              >
                {{ uploader ? uploader : sourceId }}
              </div>
            </div>
            <div
              class="flex items-center timestamp justify-self-start"
              style="grid-area: timestamp"
            >
              <Icon name="i-lucide-clock" />
              <NuxtTime
                v-if="isValidDate(publishAt)"
                :datetime="publishAt!"
                relative
              />
              <time v-else class="whitespace-nowrap">{{
                publishAt ? publishAt : "N/A"
              }}</time>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.chapter {
  --main-background: var(--mw-background);
}

.chapter {
  transition: background-color 0.1s ease-out;
}

.chapter:not(.read) {
  background: linear-gradient(
    90deg,
    rgb(var(--mw-status-blue)) 0,
    rgb(var(--mw-status-blue)) 2px,
    rgb(var(--main-background) / 0) 2px
  );
  border-radius: 2px;
}

.chapter-grid {
  -moz-column-gap: 0.5rem;
  column-gap: 0.5rem;
  cursor: pointer;
  display: grid;
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.25rem 0.5rem;
  row-gap: 0.25rem;
}

@media (min-width: 48rem) {
  .chapter-grid {
    font-size: 0.875rem;
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
