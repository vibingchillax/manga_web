<script setup lang="ts">
import type { GroupedChapter } from "../manga/details/content/UploadedChapters.vue";

const { $breakpoints } = useNuxtApp();
const { loggedIn } = useAuth();
const { getMarkers, setMarkers } = useReadMarkers();
const { oneRowChapters: oneLine } = useLayout();

const props = defineProps<{
  data: GroupedChapter;
  manga: Manga;
  noHeader?: boolean;
  noLink?: boolean;
  collapsed?: boolean;
  compact?: boolean;
  canEdit?: (chapter: UploadedChapter) => boolean;
  noReadMarker?: boolean;
  statsLoading?: boolean;
  noStats?: boolean;
  stats?: Record<string, ChapterStatistics>;
}>();

const expanded = ref(!props.collapsed);

watch(
  () => props.collapsed,
  (val) => {
    expanded.value = !val;
  },
);

const chaptersSorted = computed(() =>
  [...props.data.items].sort((a, b) =>
    a.attributes.translatedLanguage < b.attributes.translatedLanguage ? -1 : 1,
  ),
);

const isAllRead = computed(() => {
  if (chaptersSorted.value.length === 0 || !loggedIn.value) return false;
  const markers = getMarkers(props.manga.id!);
  return chaptersSorted.value.every((c) =>
    markers.includes({
      type: "uploaded",
      chapterId: c.id,
    }),
  );
});

const langCounts = computed(() => {
  const map: Record<string, number> = {};
  for (const { attributes } of chaptersSorted.value) {
    const lang = attributes.translatedLanguage;
    map[lang] = (map[lang] || 0) + 1;
  }
  return Object.entries(map);
});

const unreadBelowInfo = computed(() => {
  const ids = chaptersSorted.value.map((c) => c.id);
  const markers = getMarkers(props.manga.id!);
  const unread = ids.filter(
    (x) =>
      !markers.includes({
        type: "uploaded",
        chapterId: x,
      }),
  );

  const arr = [];
  let flag = false;

  for (const item of chaptersSorted.value) {
    const idx = unread.indexOf(item.id);
    if (idx === unread.length - 1) flag = true;

    arr.push({
      read: idx === -1 ? true : false,
      unreadBelow: !flag,
    });
  }

  return arr;
});

const isLatest = computed(() => {
  if (!props.manga.attributes?.lastChapter || chaptersSorted.value.length === 0)
    return false;

  const first = chaptersSorted.value[0];

  const chapterMatch =
    first!.attributes.chapter === props.manga.attributes.lastChapter;
  const volMatch =
    !props.manga.attributes.lastVolume ||
    first!.attributes.volume === props.manga.attributes.lastVolume;

  return chapterMatch && volMatch;
});

const shouldOneLine = computed(
  () => $breakpoints.sm && (!oneLine || props.compact),
);

const headerLabel = computed(() =>
  props.data.chapter
    ? `${$t("generic.chapter")} ${props.data.chapter}`
    : $t("generic.oneshot"),
);

const toggleAll = async (e: Event) => {
  // e.preventDefault();
  // e.stopPropagation();
  // let markers = [...getMarkers(props.manga.id!)];
  // const add: string[] = [];
  // const remove: string[] = [];
  // if (isAllRead.value) {
  //   // Mark all unread
  //   remove.push(...chaptersSorted.value.map((x) => x.id));
  //   markers = markers.filter((id) => !remove.includes(id.chapterId));
  //   expanded.value = true;
  //   console.debug(`Marking ${remove.length} chapters as unread in M:${props.manga.id}`);
  // } else {
  //   // Mark unread chapters as read
  //   const ids = chaptersSorted.value.map((x) => x.id);
  //   add.push(...ids.filter((x) => !markers.includes({ chapterId: x, type: 'uploaded' })));
  //   markers.push(...add.map((id) => ({ chapterId: id, type: 'uploaded' })));
  //   expanded.value = false;
  //   console.debug(`Marking ${add.length} chapters as read in M:${props.manga.id}`);
  // }
  // setMarkers(props.manga.id!, markers);
  // try {
  // await Zr(props.manga.id, add, remove);
  // } catch {
  // $debug(`Rollback bulk read marker change in M:${props.manga.id}`);
  // let rollback = [...getMarkers(props.manga.id)];
  // rollback.push(...remove);
  // rollback = rollback.filter((id) => !add.includes(id));
  // setMarkers(props.manga.id, rollback);
  // }
};

onMounted(() => {
  expanded.value = !(props.collapsed ?? isAllRead.value);
});
</script>

<template>
  <div
    :class="[
      'bg-accent rounded-sm',
      loggedIn && !isAllRead && !expanded && 'not-read',
    ]"
  >
    <!-- HEADER -->
    <div
      v-if="chaptersSorted.length > 1 && !noHeader"
      class="chapter-header"
      :class="shouldOneLine && 'two-line'"
      @click="expanded = !expanded"
    >
      <div class="flex">
        <UIcon
          v-if="loggedIn"
          :small="!$breakpoints.md.value"
          :med="$breakpoints.md.value"
          class="readMarker"
          :class="$breakpoints.md.value && 'med'"
          :name="isAllRead ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :style="{ opacity: isAllRead ? 0.4 : 1 }"
          @click="toggleAll"
        />
        <span class="font-bold self-center whitespace-nowrap">
          {{ headerLabel }}
        </span>

        <TagGeneric v-if="isLatest" class="bg-indication-blue text-white mx-1">
          {{ $t("_components.chapter.container.label_end") }}
        </TagGeneric>
      </div>

      <div class="langs-holder" :class="{ 'opacity-0': expanded }">
        <div
          v-for="[lang, count] in langCounts"
          :key="lang"
          class="flex items-center bg-accent rounded px-1 my-auto flex-shrink-0"
        >
          <LangFlag :lang="lang" class="!h-4 !w-4 rounded" />
          <span class="ml-1 text-[0.625rem] leading-3 font-bold align-middle">
            {{ count }}
          </span>
        </div>
      </div>

      <UIcon
        name="i-lucide-chevron-down"
        class="ml-2 size-5"
        :style="{
          transition: 'transform 150ms ease-in-out',
          transform: expanded ? '' : 'rotate(180deg)',
        }"
      />
    </div>

    <Transition name="expand">
      <div v-show="chaptersSorted.length === 1 || noHeader || expanded">
        <ChapterListItem
          v-for="(chapter, index) in chaptersSorted"
          :key="chapter.id"
          :chapter="chapter"
          :manga="manga"
          :stats="stats ? stats[chapter.id] : null"
          :compact="shouldOneLine"
          :can-edit="canEdit ? canEdit(chapter) : false"
          :expanded="chaptersSorted.length === 1 || noHeader"
          :stats-loading="statsLoading"
          :has-multiple="chaptersSorted.length > 1"
          :unread-below="unreadBelowInfo[index]!.unreadBelow"
          :last="index === chaptersSorted.length - 1"
          prependChapter
          :no-link="noLink"
          :no-read-marker="noReadMarker"
          :no-stats="stats === undefined || noStats"
        />
      </div>
    </Transition>
  </div>
</template>
<style lang="css" scoped>
.not-read {
  background: linear-gradient(
    90deg,
    rgb(var(--mw-status-blue)) 0,
    rgb(var(--mw-status-blue)) 2px,
    rgb(var(--mw-accent)) 2px
  );
}

.two-line {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.readMarker {
  height: 1.5rem !important;
  margin: -0.125rem -0.5rem -0.125rem -1rem;
  padding: 0.25rem 0.5rem;
  width: 3rem !important;
}

.readMarker.med {
  height: 1.75rem !important;
  margin: -0.25rem -0.5rem -0.25rem -1rem;
  padding: 0.25rem 0.5rem;
  width: 3.25rem !important;
}
</style>
