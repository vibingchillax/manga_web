<script setup lang="ts">
import type { ChapterStatistics } from "~~/shared/types";
const props = defineProps<{
  chapter: UploadedChapter;
  manga: Manga;
  canEdit: boolean;
  prependChapter?: boolean;
  hasMultiple: boolean;
  compact?: boolean;
  showVol?: boolean;
  noReadMarker?: boolean;
  noLink?: boolean;
  last?: boolean;
  unreadBelow?: boolean;
  statsLoading?: boolean;
  noStats?: boolean;
  stats?: ChapterStatistics | null;
}>();

const {
  chapterId,
  chapterNum,
  groups,
  manga,
  readableAt,
  title,
  translatedLanguage,
  uploader,
  url,
  volume,
} = useUploadedChapter(toRef(props, "chapter"));

const { loggedIn } = useAuth();
const { $breakpoints } = useNuxtApp();
const { oneRowChapters } = useLayout();
const { getMarkers, setMarkers } = useReadMarkers();

const toggling = ref(false);

const P = computed(
  () => $breakpoints.sm.value && (!oneRowChapters || props.compact),
);

const displayTitle = computed(() => {
  return props.hasMultiple
    ? title.value.trim() ||
        formatChapterTitle(undefined, chapterNum.value, title.value)
    : formatChapterTitle(
        props.showVol ? volume.value : null,
        chapterNum.value,
        title.value,
      );
});

const isRead = computed(() => {
  const id = manga.value?.id;
  const chId = chapterId.value;
  return id && chId
    ? getMarkers(id).includes({
        chapterId: chId,
        type: "uploaded",
      })
    : false;
});

// const prependIcon = computed(() => la(externalUrl.value) ?? undefined);
const prependIcon = computed(() => undefined);

const linkTarget = computed(() => {
  // return isExternal.value && externalUrl.value ? externalUrl.value : url.value;
  return url.value;
});

const isLatestChapter = computed(() => {
  if (!props.manga || !props.manga.attributes) return false;
  const lastVol = props.manga.attributes.lastVolume;
  const lastCh = props.manga.attributes.lastChapter;

  return (
    !!lastCh &&
    chapterNum.value === lastCh &&
    (!lastVol || volume.value === lastVol)
  );
});

const elementId = computed(() => {
  // if (!externalUrl.value) return;
  // const host = new URL(externalUrl.value).hostname;
  // return `${props.chapter.id}_${host}`;
  return;
});

// Methods
const toggleRead = async () => {
  if (!loggedIn.value || toggling.value) return;

  toggling.value = true;
  const id = props.chapter.id;
  let markers = [...getMarkers(props.manga.id!)];
  const currentlyRead = isRead.value;

  console.debug(
    `Toggling read for ${id} from ${currentlyRead} → ${!currentlyRead}`,
  );

  let req;
  if (currentlyRead) {
    // req = Zr(props.manga.id, [], [id]);
    markers = markers.filter((x) => x.chapterId !== id);
  } else {
    // req = Zr(props.manga.id, [id]);
    markers.push({
      chapterId: id,
      type: "uploaded",
    });
  }

  setMarkers(props.manga.id!, markers);

  // if (dn(await req)) {
  //   alert(t("_components.chapter.list_item.warning_error_marking_read_unread"));
  //   // revert
  //   markers = [...getMarkers(props.manga.id)];
  //   if (currentlyRead) markers.push(id);
  //   else markers.splice(markers.indexOf(id), 1);

  //   setMarkers(props.manga.id, markers);
  // }

  toggling.value = false;
};

const autoToggle = async () => {
  // if (isExternal.value && !toggling.value && !isRead.value) {
  //   await toggleRead();
  // }
};

const stopIfNoComments = (ev: MouseEvent) => {
  if (!props.stats?.comments) ev.preventDefault();
};
</script>

<template>
  <div
    class="chapter relative"
    :class="{
      read: isRead || noReadMarker || !loggedIn,
    }"
  >
    <div class="inner">
      <ChapterLine
        v-if="hasMultiple"
        :last="last"
        :is-read="isRead"
        :unread-below="unreadBelow"
        :compact="compact"
      />

      <NuxtLink
        class="chapter-grid flex-grow"
        :class="{
          'one-line': !P,
          'no-stats': noStats,
          'no-link': noLink,
        }"
        ref="chapter-container"
        :to="noLink ? undefined : linkTarget"
        @click="autoToggle"
        @auxclick="autoToggle"
      >
        <!-- title & stats -->
        <Wrap
          :wrap="!$breakpoints.sm.value"
          is="div"
          class="flex gap-1 justify-between"
          style="grid-area: title-views"
        >
          <NuxtLink
            class="flex flex-grow items-center"
            :to="noLink ? undefined : linkTarget"
            :id="`chaptertitle_${elementId}`"
            :title="displayTitle"
            style="grid-area: title"
            @click.stop="autoToggle"
            @auxclick.stop="autoToggle"
          >
            <!-- read marker -->
            <UIcon
              v-if="loggedIn && !noReadMarker"
              class="flex-shrink-0 cursor-pointer readMarker size-5"
              :class="{ 'opacity-40': isRead }"
              :name="isRead ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click.stop.prevent="toggleRead"
            />

            <LangFlag
              :lang="translatedLanguage ?? '??'"
              class="flex-shrink-0 !h-5 !w-5 -mx-0.5"
              @click.stop.prevent
            />

            <!-- Title -->
            <span
              class="chapter-link ml-2 font-bold my-auto flex items-center space-x-1 break-all"
            >
              <!-- :class="{ 'opacity-40': isUnavailable }"> -->
              <!-- <pt v-if="isExternal" small icon="link" /> -->
              <span>{{ displayTitle }}</span>
            </span>

            <TagGeneric
              v-if="!hasMultiple && isLatestChapter"
              class="bg-indication-blue text-white ml-2"
            >
              {{ $t("_components.chapter.list_item.label_end") }}
            </TagGeneric>

            <NuxtLink
              v-if="canEdit && !noLink"
              :to="`${url}/edit`"
              class="mx-1 px-1 flex flex-col justify-center"
              title="Edit chapter"
            >
              <UIcon class="size-5" name="i-lucide-pencil" />
            </NuxtLink>
          </NuxtLink>

          <CommentCount
            v-if="!noStats"
            class="justify-self-start"
            style="grid-area: comments"
            window-position="left"
            :stats="stats?.comments"
            :loading="statsLoading"
            type="chapter"
            :id="chapter.id"
            hover
            @click.stop="stopIfNoComments"
            @auxclick.stop="stopIfNoComments"
          />
        </Wrap>

        <Wrap
          :wrap="!$breakpoints.sm.value"
          is="div"
          class="flex gap-1 justify-between"
          style="grid-area: group-comments"
        >
          <GroupTag
            class="flex items-center justify-self-start"
            style="grid-area: groups"
            :groups="groups ?? []"
            :no-link="noLink"
            :prepend-icon="prependIcon"
            lift
            @click.stop
            @auxclick.stop
          />

          <div v-if="!noStats" class="flex items-center">
            <UIcon class="mr-1 size-5" name="i-lucide-eye" />
            <span class="text-[0.8em]">N/A</span>
          </div>
        </Wrap>

        <Wrap
          :wrap="!$breakpoints.sm.value"
          is="div"
          class="flex gap-1 justify-between"
          style="grid-area: uploader-timestamp"
        >
          <UserTag
            class="flex items-center justify-self-start"
            style="grid-area: uploader"
            :user="uploader ?? undefined"
            :no-link="noLink"
            lift
            @click.stop
            @auxclick.stop
          >
            <!-- <template v-if="isOfficial" #prepend>
              <pt small class="mr-1.5 md:mr-2 stroke-[3]" color="primary" icon="check" />
            </template> -->

            <!-- <template v-if="isOfficial">
              <span class="ml-1">Official Publisher</span>
            </template> -->
          </UserTag>

          <div
            class="flex items-center timestamp justify-self-start"
            style="grid-area: timestamp"
            @click.stop
            @auxclick.stop
          >
            <pt
              class="mr-1 sm:mr-1.5 md:mr-2"
              :class="{ '!mr-1': !P }"
              small
              icon="clock"
            />
            <Hl
              :datetime="readableAt ?? ''"
              :micro="$breakpoints.md && !P"
              class="whitespace-nowrap"
            />
          </div>
        </Wrap>
      </NuxtLink>
    </div>
  </div>
</template>
<style lang="css" scoped>
.chapter {
  --main-background: var(--mw-background);
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

.chapter:not(:last-child) {
  border-bottom: 1px solid;
  border-color: rgb(var(--mw-accent-10));
}

.chapter {
  transition: background-color 0.1s ease-out;
}

.chapter.unavailable {
  --main-background: var(--mw-accent-active);
}

.chapter.unavailable .chapter-grid {
  cursor: not-allowed;
}

@media (any-hover: hover) {
  .chapter:hover:not(.unavailable) {
    background-color: rgb(var(--mw-accent-hover));
  }
}

.chapter:active {
  background-color: rgb(var(--mw-accent-active));
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
  grid-template-areas: "title-views" "group-comments" "uploader-timestamp";
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
}

.chapter-grid.no-link {
  pointer-events: none;
}

@media (min-width: 40rem) {
  .chapter-grid {
    grid-template-areas: "title timestamp views" "groups uploader comments";
    grid-template-columns: auto 124px 50px;
    grid-template-rows: auto auto;
  }

  .chapter-grid.no-stats {
    grid-template-areas: "title timestamp" "groups uploader";
    grid-template-columns: auto 124px;
    grid-template-rows: auto auto;
  }
}

@media (min-width: 48rem) {
  .chapter-grid {
    grid-template-columns: auto 150px 60px;
    grid-template-rows: auto auto;
  }

  .chapter-grid.no-stats:not(.one-line) {
    grid-template-columns: auto 150px;
  }

  .chapter-grid.one-line {
    font-size: 0.75rem;
    grid-template-areas: "title spacer groups uploader comments views timestamp";
    grid-template-columns:
      fit-content(100%) auto fit-content(100%) fit-content(100%)
      40px 48px 48px;
    line-height: 1rem;
    row-gap: 0;
  }

  .chapter-grid.one-line.no-stats {
    grid-template-areas: "title spacer groups uploader timestamp";
    grid-template-columns:
      fit-content(100%) auto fit-content(100%) fit-content(100%)
      min-content;
  }
}

.readMarker {
  height: 1.5rem !important;
  margin: -0.125rem -0.5rem -0.125rem -1rem;
  padding: 0.25rem 0.5rem;
  width: 3rem !important;
}
</style>
