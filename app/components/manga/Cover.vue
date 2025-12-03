<script setup lang="ts">
import { Lightbox, NuxtLink } from "#components";

const props = withDefaults(
  defineProps<{
    src?: string;
    manga?: Manga;
    label?: string;
    maxLength?: number;
    noLink?: boolean;
    openInNewTab?: boolean;
    coverFile?: CoverData["data"];
    noTitle?: boolean;
    contain?: boolean;
    showFlag?: boolean;
    use256?: boolean;
    lightbox?: boolean;
    fillHeight?: boolean;
    fixedAspect?: boolean;
  }>(),
  {
    noLink: false,
  },
);

const loading = ref(false);
const lightboxVisible = ref(false);

const { cover, title, detailsUrl } = useManga(props.manga);

const gatewayUrl = useAppConfig().kuboGatewayUrl

const componentTag = computed(() => {
  if (props.noLink) return "div";
  if (props.lightbox) return "a";
  return detailsUrl.value ? NuxtLink : "div";
});

const displayLabel = computed(() => {
  if (props.label) return props.label;
  const max = props.maxLength ?? 40;
  if (title.value!.length <= max) return title.value;
  const truncated = title.value!.substring(0, max);
  return (
    truncated.substring(
      0,
      Math.min(truncated.length, truncated.lastIndexOf(" ")),
    ) + "..."
  );
});

const computedSrc = computed(() => {
  if (!props.manga) return "";

  if (props.coverFile) {
    return props.use256 ? prependGatewayUrl(props.coverFile.cid256) : prependGatewayUrl(props.coverFile.cid512)
  }

  if (props.use256) {
    return cover.value.url256;
  }

  return cover.value.url512
});

const fullResSrc = computed(() => {
  if (!props.manga) return "";
  return props.coverFile ? prependGatewayUrl(props.coverFile.cid) : cover.value.urlOriginal;
});

function onClick(e: MouseEvent) {
  if (props.lightbox) {
    e.preventDefault();
    lightboxVisible.value = true;
  }
}
</script>
<template>
  <component
    :is="componentTag"
    :href="
      componentTag !== NuxtLink
        ? lightbox
          ? fullResSrc
          : detailsUrl
        : undefined
    "
    :target="openInNewTab ? '_blank' : '_self'"
    :to="detailsUrl"
    class="group flex items-start relative mb-auto select-none"
    :class="{
      'w-full h-full': fillHeight,
      aspect: fixedAspect,
    }"
    @click="onClick"
  >
    <div
      v-if="lightbox"
      class="flex opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center inset-0 absolute bg-black/50 pointer-events-none rounded"
    >
      <UIcon name="i-lucide-expand" class="size-10" />
    </div>

    <USkeleton
      v-if="loading"
      class="rounded shadow-md w-full"
      style="padding-bottom: 141.42%"
    />

    <NuxtImg
      v-if="!loading && (computedSrc || src)"
      class="rounded shadow-md w-full"
      :class="{
        'fixed left-full top-full w-0 h-0': loading,
        'h-full': fillHeight,
        'h-auto': !fillHeight,
      }"
      :src="computedSrc || src"
      alt="Cover image"
      @load="loading = false"
    />

    <LangFlag
      v-if="manga && showFlag"
      class="absolute right-2"
      :class="noTitle ? 'bottom-1.5' : 'top-1.5'"
      style="z-index: 1"
      :lang="manga.attributes?.originalLanguage ?? 'jp'"
    />

    <!-- <span v-if="!noTitle && !src" class="subtitle rounded-b" :class="{ 'show-flag': showFlag }"> -->
    <span
      v-if="!noTitle"
      class="subtitle rounded-b"
      :class="{ 'show-flag': showFlag }"
    >
      {{ displayLabel }}
    </span>
    <Lightbox
      v-if="lightbox"
      v-model:open="lightboxVisible"
      :src="computedSrc"
      :fullRes="fullResSrc"
    />
  </component>
</template>
<style lang="css" scoped>
img {
  -o-object-fit: cover;
  object-fit: cover;
  -o-object-position: center center;
  object-position: center center;
}

.aspect {
  height: 0;
  overflow: hidden;
  padding-bottom: 142.307692%;
  position: relative;
}

.aspect img {
  height: 100%;
  top: 0;
}

.aspect img,
.subtitle {
  left: 0;
  position: absolute;
  width: 100%;
}

.subtitle {
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.8));
  bottom: 0;
  color: #fff;
  padding: 1rem 0.5rem 0.5rem;
}

.subtitle.show-flag {
  padding-right: calc(1rem + 25px);
}
</style>
