<script lang="ts">
export interface GroupedChapter {
  chapter: string;
  items: UploadedChapter[];
}

interface GroupedVolume {
  volume: string;
  chapters: GroupedChapter[];
  expanded: boolean;
  continuousList: string;
}

function formatChapterRanges(
  chapters: (string | number | undefined)[],
): string {
  const nums = chapters
    .map((ch) => {
      if (typeof ch === "number") return ch;
      if (typeof ch === "string") {
        const match = ch.match(/\d+/);
        return match ? parseInt(match[0], 10) : undefined;
      }
      return undefined;
    })
    .filter((n): n is number => n !== undefined);

  if (!nums.length) return "";

  // Sort ascending
  nums.sort((a, b) => a - b);

  const ranges: string[] = [];
  let start = nums[0];
  let end = nums[0];

  for (let i = 1; i <= nums.length; i++) {
    const current = nums[i];
    if (current === end + 1) {
      end = current;
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = end = current;
    }
  }

  return ranges.slice(0, 3).join(", ");
}
</script>
<script setup lang="ts">
const props = defineProps<{
  manga: Manga;
  statistics: any;
}>();

const emit = defineEmits<{
  (e: "userViewableChaptersChanged", value: boolean): void;
}>();

const route = useRoute();
const router = useRouter();
const { $breakpoints } = useNuxtApp();
const { loggedIn, session } = useAuth();

const loaderRef = ref<HTMLElement | null>();
const showMarkAllModal = ref(false);
const showIndexModal = ref(false);
// const pagination = oa();
// const { page, order } = pagination.value;
// const page =
// const currentPage = ref(page ?? 1);
const currentPage = ref(1);
const order = ref<"desc" | "asc">("desc");
// const currentPageProxy = R({
//   get: () => currentPage.value,
//   set: (val: number) => {
//     currentPage.value = val;
//   },
// });
const totalChapters = ref(0);
const isLoading = ref(false);
const collapsed = ref(false);
// const descending = ref(order !== "asc");
const descending = ref(order.value !== "asc");
const rawChapters = ref<UploadedChapter[]>([]);
const groupedChapters = ref<GroupedVolume[]>([]);
const userRelationships = ref<any[]>([]);
const showUnavailable = ref(true);

function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): [K, T[]][] {
  const map = new Map<K, T[]>();
  for (const item of array) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries());
}

// if ($auth.loggedIn) {
//   Ue(async () => {
//     const user = await ca($auth.user.uid);
//     const followedIds = user.relationships.filter(it).map((r) => r.id);
//     const uploads = await zt(followedIds);
//     userRelationships.value = uploads
//       .filter((u) => u.relationships.find(ma)?.id === user.id)
//       .map((u) => u.id);
//   }, "$Ypv6E30Akf");
// }

const chapterIds = computed(() =>
  groupedChapters.value.flatMap((g) =>
    g.chapters.flatMap((c) => c.items.flatMap((i) => i.id)),
  ),
);

// const { pending: statsPending, fetch: fetchStats, statisticsBatch } = ia(
//   chapterIds,
//   _e.CHAPTER
// );

const { pending: refreshPending, refresh: refreshChapters } = useAsyncData(
  `manga-${props.manga.id}-chapters`,
  async () => {
    const data = await $fetch(`/api/manga/${props.manga.id}/feed`, {
      query: {
        translatedLanguage: storeToRefs(usePreferencesStore()).filteredLanguages
          .value,
        limit:
          storeToRefs(usePreferencesStore()).paginationCount.value *
          storeToRefs(usePreferencesStore()).listMultiplier.value,
        // includes: [_e.GROUP, _e.USER],
        "includes[]": ["scanlation_group", "user"],
        "order[volume]": descending.value ? "desc" : "asc",
        "order[chapter]": descending.value ? "desc" : "asc",
        offset:
          (currentPage.value - 1) *
          storeToRefs(usePreferencesStore()).paginationCount.value *
          storeToRefs(usePreferencesStore()).listMultiplier.value,
        "contentRating[]": storeToRefs(usePreferencesStore()).contentRating
          .value,
        "excludedGroups[]": storeToRefs(usePreferencesStore()).groupBlacklist
          .value,
        "excludedUploaders[]": storeToRefs(usePreferencesStore()).userBlacklist
          .value,
        // includeUnavailable: showUnavailable.value ? 1 : 0,
        // excludeExternalUrl: "blinktoon.com",
      },
    });
    // const data = await $fetch(props.manga.id, {
    //   translatedLanguage: Ve(vt()).filteredLanguages.value,
    //   limit:
    //     Ve(vt()).paginationCount.value * Ve(vt()).listMultiplier.value,
    //   includes: [_e.GROUP, _e.USER],
    //   order: {
    //     volume: descending.value ? "desc" : "asc",
    //     chapter: descending.value ? "desc" : "asc",
    //   },
    //   offset: (currentPage.value - 1) * Ve(vt()).paginationCount.value * Ve(vt()).listMultiplier.value,
    //   contentRating: Tt,
    //   excludedGroups: Ve(vt()).groupBlacklist.value,
    //   excludedUploaders: Ve(vt()).userBlacklist.value,
    //   includeUnavailable: showUnavailable.value ? 1 : 0,
    //   excludeExternalUrl: "blinktoon.com",
    // });

    if (data.data.length === 0 && data.count > 0) {
      await router.replace({ path: route.path, query: { page: 1 } });
      currentPage.value = 1;
      refreshChapters();
      return;
    }

    totalChapters.value = data.count;
    rawChapters.value = data.data as UploadedChapter[];

    emit("userViewableChaptersChanged", !!totalChapters.value);

    groupedChapters.value = groupBy(
      rawChapters.value,
      (ch) => ch.attributes.volume ?? "",
    ).map(([volume, items]) => ({
      volume,
      chapters: groupBy(items, (ch) => ch.attributes.chapter ?? "").map(
        ([chapter, chapterItems]) => ({
          chapter,
          items: chapterItems.sort(
            (a, b) =>
              new Date(b.attributes.readableAt).getTime() -
              new Date(a.attributes.readableAt).getTime(),
          ),
        }),
      ),
      expanded: !collapsed.value,
      continuousList: formatChapterRanges(
        items.map((i) => i.attributes.chapter).filter((c): c is string => !!c),
      ),
    }));

    // await fetchStats();
  },
);

const totalPages = computed(() =>
  Math.ceil(
    totalChapters.value /
      (storeToRefs(usePreferencesStore()).paginationCount.value *
        storeToRefs(usePreferencesStore()).listMultiplier.value),
  ),
);

// Check if all chapters read
const allRead = computed(() => {
  // const markers = [...Ve(Dt()).getMarkers(props.manga.id)];
  const markers = [...useReadMarkers().getMarkers(props.manga.id!)];
  const chapterList = groupedChapters.value
    .flatMap((g) => g.chapters)
    .flatMap((c) => c.items)
    .map((i) => i.id);
  return !chapterList.some(
    (id) =>
      !markers.includes({
        chapterId: id,
        type: "uploaded",
      }),
  );
});

// Permission
const canEdit = (chapter: UploadedChapter): boolean => {
  // if (!$auth.user) return false;
  // return Lt($auth) || chapter.relationships.find(ra)?.id === $auth.user.uid || chapter.relationships.filter(it).some((id) => userRelationships.value.includes(id));
  if (session.value?.roles.includes("admin")) return true;
  return false;
};

// Sorting
const toggleOrder = (desc: boolean) => {
  descending.value = desc;
  router.replace({
    path: route.path,
    query: { ...route.query, order: descending.value ? "desc" : "asc" },
  });
};

// Total items in chapters
const countItems = (chapters: GroupedChapter[]) =>
  chapters.reduce((acc, ch) => acc + ch.items.length, 0);

// Debounced refresh
const debouncedRefresh = useDebounceFn(refreshChapters, 500);

const markAll = async () => {
  // showMarkAllModal.value = false;
  // const markers = [...Ve(Dt()).getMarkers(props.manga.id)];
  // const chapterList = groupedChapters.value.flatMap((g) => g.chapters).flatMap((c) => c.items).map((i) => i.id);
  // const allReadStatus = allRead.value;
  // const toMark = allReadStatus ? markers.filter((id) => !chapterList.includes(id)) : [...new Set([...markers, ...chapterList])];
  // Dt().setMarkers(props.manga.id, toMark);
  // try {
  //   let batches: any[] = [];
  //   let tempList = [...chapterList];
  //   while (tempList.length > 0) {
  //     batches.push(rt(props.manga.id, allReadStatus ? [] : tempList.splice(0, 100)));
  //   }
  //   await ut(batches);
  // } catch {
  //   Dt().setMarkers(props.manga.id, markers);
  // }
};

// Watchers
watch(
  () => props.manga,
  (newManga) => {
    if (newManga) {
      rawChapters.value = [];
      groupedChapters.value = [];
      refreshChapters();
    }
  },
);

watch(descending, () => refreshChapters);
watch(
  [storeToRefs(usePreferencesStore()).filteredLanguages, showUnavailable],
  () => {
    currentPage.value = 1;
    debouncedRefresh();
  },
);

watch(currentPage, () => {
  refreshChapters();
  if (loaderRef.value) {
    const top =
      loaderRef.value.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top });
  }
});
</script>

<template>
  <div class="flex gap-6 items-start">
    <MangaDetailsOtherInfo
      v-if="$breakpoints.xl.value"
      :id="manga.id"
      :manga="manga"
      class="flex"
      style="flex-basis: 30%; max-width: 400px; min-width: 25%"
    />

    <div class="flex-grow">
      <div class="flex gap-x-2 mb-4">
        <UButton
          class="mr-auto"
          @click="toggleOrder(!descending)"
          :disabled="refreshPending"
        >
          {{ descending ? "Descending" : "Ascending" }}
        </UButton>

        <UButton
          v-if="loggedIn"
          @click="showMarkAllModal = true"
          :disabled="refreshPending"
        >
          Mark all on page as {{ allRead ? "unread" : "read" }}
        </UButton>

        <!-- <UButton xx-small @click="showIndexModal = true">Index</UButton> -->
        <UButton @click="showIndexModal = true">Index</UButton>
      </div>

      <!-- Loading -->
      <div
        v-if="refreshPending"
        class="flex flex-grow items-center justify-center"
      >
        <!-- <ProgressIndicator indeterminate /> -->
        Loading...
      </div>

      <!-- Chapter list -->
      <div v-else-if="manga && groupedChapters.length">
        <!-- <He type="_e.CHAPTER" window-position="left"> -->
        <!-- <div ref="loader"> -->
        <div
          v-for="(group, idx) in groupedChapters"
          :key="idx"
          class="flex flex-col"
          :class="idx !== groupedChapters.length - 1 && 'mb-6'"
        >
          <!-- Volume header -->
          <div
            class="grid grid-cols-12 mb-2 cursor-pointer"
            @click.stop="group.expanded = !group.expanded"
          >
            <div class="col-span-4">
              {{ group.volume ? `Volume ${group.volume}` : "No Volume" }}
            </div>
            <div class="text-center col-span-4">
              {{ group.continuousList && "Ch." }}
              {{ group.continuousList || "" }}
            </div>
            <div class="text-right col-span-4">
              <span>{{ countItems(group.chapters) || "?" }}</span>
              <UIcon
                name="i-lucide-chevron-down"
                :style="{
                  transition: 'transform 150ms ease-in-out',
                  transform: group.expanded ? 'rotate(180deg)' : '',
                }"
              />
            </div>
          </div>

          <div class="rounded flex flex-col gap-2">
            <ChapterListItem
              v-for="chapter in group.chapters"
              :key="chapter.chapter"
              :manga="manga"
              :data="chapter"
              :collapsed="collapsed"
              :canEdit="canEdit"
              v-show="group.expanded"
            />

            <!-- :stats-loading="statsPending" -->
            <!-- :stats="statisticsBatch" -->
          </div>
        </div>
        <!-- </div> -->
        <!-- </He> -->

        <UPagination
          v-if="totalPages > 1"
          v-model="currentPage"
          :total="totalPages"
          class="mt-6"
        />
        <!-- :use-query="false" -->
      </div>

      <!-- No chapters -->
      <div v-else-if="!refreshPending && totalChapters === 0" class="flex-grow">
        <ProseNote>No Chapters</ProseNote>
      </div>

      <!-- Fallback loading -->
      <div v-else class="flex flex-grow items-center justify-center">
        <!-- <ProgressIndicator indeterminate /> -->
        Loading...
      </div>
    </div>

    <!-- Mark All Modal -->
    <UModal v-model:open="showMarkAllModal" small>
      <!-- <Re>
        <Te>Mark all as {{ allRead ? "unread" : "read" }}?</Te>
        <Le>Are you sure you want to mark all chapters on this page as {{ allRead ? "unread" : "read" }}?</Le>
        <Me>
          <be />
          <V small @click="showMarkAllModal = false">No</V>
          <V color="primary" small glow @click="markAll">Yes</V>
        </Me>
      </Re> -->
    </UModal>

    <UModal v-model:open="showIndexModal">
      <!-- <Re v-slot="{ startIndex }">
        <Te :index="startIndex">Index</Te>
        <Le>
          <p class="mb-4 text-midTone">
            The Index ignores user blocks, group blocks, and language filters.
          </p>
          <Ke :manga="manga" />
        </Le>
      </Re> -->
    </UModal>
  </div>
</template>
