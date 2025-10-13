<script setup lang="ts">
const props = withDefaults(defineProps<{
  background?: string
  skeleton?: boolean
  noIcon?: boolean
  isManga?: boolean
  title?: string
  altTitle?: string
  subTitle?: string
  supportLink?: string
  supportText?: string
}>(), {
  background: '/img/group-banner.png',
})

const route = useRoute()
// const { $breakpoints, $isMobileApp } = useSomething()
// const { setNavBarTitle, menuActive } = useSomething()
const { menuActive } = storeToRefs(useLayout())
// const { ambient } = useSomething()

// onMounted(() => setNavBarTitle(null))

const bannerStyle = computed(() => ({
  backgroundImage: props.background ? `url(${props.background})` : undefined,
  // width: !$isMobileApp && $breakpoints.lg && menuActive.value
  //   ? 'calc(100% - 256px)'
  //   : '100%'
  width: menuActive.value
    ? 'calc(100% - 256px)'
    : '100%'
}))

const hasGradient = computed(() =>
  ["/title", "/group", "/user", "/"].some(path => route.path.includes(path + "/"))
)
</script>
<template>
  <div class="layout-container" :class="[
    isManga ? 'manga' : 'page',
    noIcon && 'no-art',
    hasGradient && 'has-gradient',
    // !$isMobileApp && 'px-4'
    'px-4'
  ]">
    <!-- <div
      v-if="$breakpoints.sm && ambient"
      class="absolute top-0 left-0 z-[-2] w-full h-[640px] blur-xl"
      :style="`background: radial-gradient(circle at top, rgb(var(--md-background) / 0.8), rgb(var(--md-background)) 75%), no-repeat top 35% center / 100% url(${background});`"
    ></div> -->
    <div class="absolute top-0 left-0 z-[-2] w-full h-[640px] blur-xl"
      :style="`background: radial-gradient(circle at top, rgb(var(--mw-background) / 0.8), rgb(var(--mw-background)) 75%), no-repeat top 35% center / 100% url(${background});`">
    </div>
    <div class="banner-container" :class="{ block: isManga }">
      <USkeleton v-if="!background && skeleton" style="height: 100%" />
      <div v-else-if="background" class="banner-image" :style="bannerStyle"></div>
      <div v-else class="banner-placeholder" :style="bannerStyle"></div>
      <div class="banner-shade"></div>
    </div>

    <div v-if="!isManga" class="clear-banner"></div>
    <div :class="!isManga && 'self-end'" style="grid-area: art">
      <slot name="icon"></slot>
    </div>

    <div v-if="isManga" class="title">
      <template v-if="title || altTitle">
        <BigText extra-text-class="line-clamp-2 leading-5 pt-1" class="mb-1"
          style="text-shadow: rgba(0, 0, 0, 0.3) 1px 2px 4px">
          {{ title }}
        </BigText>
        <!-- :small="!$breakpoints.sm"
          :target-height="$breakpoints.sm ? undefined : 180"
          :extra-text="$breakpoints.sm ? undefined : altTitle" -->

        <div v-if="altTitle" class="font-normal line-clamp-2 text-base sm:text-xl inline-block leading-5"
          :title="altTitle">
          {{ altTitle }}
        </div>

        <!-- <Lf class="hidden sm:block" />  -->
        <!-- ^ ? -->
        <div class="flex-grow hidden sm:block"></div>

        <div class="flex flex-row gap-2">
          <div v-if="subTitle && !supportLink" class="font-normal text-xs sm:text-base truncate">
            {{ subTitle }}
          </div>

          <!-- <Gt
            v-else-if="supportLink && $breakpoints.sm"
            class="flex whitespace-nowrap text-base mt-2 w-[13.75rem]"
            color="nami-comi-blue"
            hover-animation="shine"
            small
            :href="supportLink"
            target="_blank"
          >
            <div class="grid">
              <span class="truncate">{{ supportText }}</span>
            </div>
          </Gt> -->
        </div>
      </template>
    </div>

    <div style="grid-area: buttons" :class="[{ 'sm:ml-2': isManga }, 'relative']">
      <slot name="buttons"></slot>
    </div>

    <div v-if="isManga" style="grid-area: stats" class="sm:mx-2 mt-auto sm:mt-0">
      <slot name="stats"></slot>
    </div>

    <div v-if="isManga" style="grid-area: info" class="sm:mx-2">
      <slot name="info"></slot>
    </div>

    <div v-if="isManga" style="grid-area: synopsis" class="min-w-0">
      <slot name="synopsis"></slot>
    </div>

    <div style="grid-area: content" :class="['min-w-0', { 'sm:ml-2': !isManga }]">
      <slot name="content"></slot>
    </div>

    <slot></slot>
  </div>
</template>
<style lang="css" scoped>
.layout-container {
  display: grid;
  position: relative;
  --banner-overlap: calc(var(--navbar-height) + var(--top-margin));
  --banner-top: calc(var(--banner-overlap)*-1);
}

.layout-container .clear-banner {
  grid-area: clear-banner;
  height: var(--banner-height)
}

.layout-container.manga {
  --banner-overlay-gradient: linear-gradient(to bottom, rgb(var(--mw-background)/.8) 0%, rgb(var(--mw-background)) 100%);
  gap: .75rem 1rem;
  grid-template-areas: "art title" "art stats" "info info" "buttons buttons" "synopsis synopsis" "content content";
  grid-template-columns: 100px auto
}

@media (min-width:40rem) {
  .layout-container.manga {
    --banner-filter: blur(4px);
    --banner-overlay-gradient: linear-gradient(67.81deg, rgba(0, 0, 0, .64) 35.51%, transparent);
    gap: 1rem;
    grid-template-areas:
      "left art      title    right"
      "left art      buttons  right"
      "left art      info     right"
      "left art      stats    right"
      "left art      padding  right"
      "left synopsis synopsis right"
      "left content  content  right";
    grid-template-columns: 1fr 200px minmax(0, calc(1240px - 3.5rem)) 1fr
  }
}

.layout-container.page {
  --banner-overlap: calc(var(--navbar-height) + var(--top-margin));
  --banner-height: 8.5rem
}

@media (min-width:40rem) {
  .layout-container.page {
    --banner-height: 12.5rem;
    --banner-overlap: var(--top-margin)
  }
}

.layout-container.page {
  gap: .5rem
}

@media (min-width:64rem) {
  .layout-container.page {
    padding-left: 4rem;
    padding-right: 4rem
  }
}

.layout-container.page {
  grid-template-areas: "art-pad clear-banner" "art clear-banner" "art buttons" "content content";
  grid-template-columns: 120px auto
}

@media (min-width:40rem) {
  .layout-container.page {
    grid-template-areas: "left art-pad clear-banner right" "left art clear-banner right" "left art content right" "left buttons content right" "left padding content right";
    grid-template-columns: 1fr 200px minmax(0, calc(1340px - 3.5rem)) 1fr
  }
}

.layout-container.page.no-art {
  grid-template-areas: "art-pad clear-banner" "art clear-banner" "buttons buttons" "content content"
}

@media (min-width:40rem) {
  .layout-container.page.no-art {
    grid-template-areas: "left art-pad clear-banner right" "left art clear-banner right" "left buttons content right" "left padding content right"
  }
}

@media not (min-width:40rem) {
  .layout-container.has-gradient:not(.manga) {
    --banner-overlay-gradient: linear-gradient(to bottom, rgb(var(--mw-background)) 0%, rgb(var(--mw-background)/.8) 56px, rgb(var(--mw-background)/0) 50%)
  }
}

.banner-container {
  clip: rect(0, auto, auto, 0);
  clip-path: inset(0 0);
  left: 0;
  position: absolute;
  right: 0;
  top: var(--banner-top);
  width: auto;
  z-index: -1
}

.banner-container,
.banner-image {
  height: calc(var(--banner-height) + var(--banner-overlap))
}

.banner-image {
  background-position: center 25%;
  background-size: cover;
  position: fixed;
  transition: width .15s ease-in-out;
  width: 100%
}

.banner-container>.banner-shade {
  -webkit-backdrop-filter: var(--banner-filter);
  backdrop-filter: var(--banner-filter);
  background: var(--banner-overlay-gradient);
  bottom: 0;
  height: auto;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  width: auto
}

.banner-placeholder {
  background-image: url(../img/group-banner.png);
  background-position: 50%;
  background-size: cover;
  height: calc(var(--banner-height) + var(--banner-overlap));
  position: fixed;
  transition: width .15s ease-in-out;
  width: 100%
}

.title {
  display: flex;
  flex-direction: column;
  font-size: 24px;
  font-weight: 700;
  grid-area: title;
  line-height: 100%;
  min-width: 0;
  position: relative
}

@media (min-width:40rem) {
  .title {
    padding-bottom: .5rem;
    padding-left: .5rem;
    padding-right: .5rem;
    --tw-text-opacity: 1;
    color: rgb(255 255 255/var(--tw-text-opacity, 1));
    height: var(--banner-height);
    justify-content: flex-end
  }
}

.profile {
  border: 2px solid;
  border-color: rgb(var(--mw-background));
  border-radius: 50%
}
</style>