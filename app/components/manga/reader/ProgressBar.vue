<script setup lang="ts">
import { ProgressModeEnum, ProgressSideEnum, ReadStyleEnum } from '~/stores/useReaderMenu';
const props = defineProps<{ disabled?: boolean }>();

const pageSlider = ref<HTMLElement | null>(null)
const sliderBall = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const sliderDirection = ref<ProgressSideEnum>(ProgressSideEnum.Bottom);
const isAnimationDisabled = ref(false);

const reader = useReaderStore()
const pageManager = useReaderPageManager()
const settings = useReaderMenu()

const {
  setCurrentPageGroup,
  setCurrentProgress,
  setScrolling,
} = reader;

const {
  chapterMeta,
  immersionBreak,
  currentPageGroup,
  currentProgress,
  immersive,
  scrollbarOffset,
} = storeToRefs(reader);

const {
  pageState,
  pageGroups,
  pages,
} = storeToRefs(pageManager)

const {
  readStyle,
  showPageNumber,
  progressMode,
  progressSide,
  progressHeight
} = storeToRefs(settings)

const isLoading = computed(() => pageState.value !== 'loaded')
const isRTL = computed(() => readStyle.value === ReadStyleEnum.RTL)
const sliderHeight = computed(() => `${progressHeight}px`)

const totalPages = computed(() => pageGroups.value.length ?? 1);
const currentProgressPercent = computed(() =>
  currentPageGroup.value + 1
);

const sliderFraction = ref((currentProgressPercent.value - 1) / Math.max(1, totalPages.value - 1));
watch([currentProgressPercent, totalPages], ([progress, total]) => {
  sliderFraction.value = (progress - 1) / Math.max(1, total - 1);
});

const sliderBallSize = computed(() => `${100 / Math.max(1, totalPages.value)}%`);

const sliderPosition = computed(() => {
  const totalLength = `calc(100% - ${sliderBallSize.value})`;
  const halfBall = `calc(${sliderBallSize.value} / 2)`;
  let fraction = sliderFraction.value;

  fraction = Math.round(fraction * Math.max(0, totalPages.value - 1)) / Math.max(1, totalPages.value - 1);
  return `calc(${fraction} * ${totalLength} + ${halfBall})`;
});

const clamp = (val: number, max: number, min: number) => Math.max(min, Math.min(val, max));

const isMouseEvent = (e: MouseEvent | TouchEvent) => !('touches' in e);

const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  updateSlider(event);

  if (isMouseEvent(event)) {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
  } else {
    window.addEventListener('touchmove', onDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
  }
};

const onDrag = (event: MouseEvent | TouchEvent) => updateSlider(event);

const stopDrag = () => {
  isDragging.value = false;

  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', stopDrag);
};

const updateSlider = (event: MouseEvent | TouchEvent) => {
  if (!pageSlider.value) return;

  let clientPos: number;
  if (event instanceof MouseEvent) {
    clientPos = (readStyle.value === ReadStyleEnum.RTL) ? (pageSlider.value.getBoundingClientRect().right - event.clientX) : event.clientX;
  } else {
    const touch = event.touches[0];
    if (!touch) return;
    clientPos = (readStyle.value === ReadStyleEnum.RTL) ? (pageSlider.value.getBoundingClientRect().right - touch.clientX) : touch.clientX;
  }

  const rect = pageSlider.value.getBoundingClientRect();
  const totalLength = rect.width;
  let fraction = clamp(clientPos / totalLength, 1, 0);

  if (isRTL.value) fraction = 1 - fraction;

  sliderFraction.value = fraction;

  const newPage = Math.round(fraction * (totalPages.value - 1));
  if (newPage !== currentPageGroup.value) {
    setCurrentPageGroup(newPage);
  }
};

onMounted(() => window.addEventListener('blur', stopDrag));
onBeforeUnmount(() => window.removeEventListener('blur', stopDrag));
</script>

<template>
  <div class="reader-progress-wrap" :class="[
    'mw--reader-progress',
    {
      'normal': progressMode === ProgressModeEnum.Normal,
      'side left': progressSide === ProgressSideEnum.Left,
      'side right': progressSide === ProgressSideEnum.Right
    },
    {
      'no-anim': isAnimationDisabled,
      break: immersionBreak || isDragging,
      'show-num': showPageNumber
    },
  ]" :style="{
    bottom: `${scrollbarOffset ?? 0}px`,
    '--progress-bar-size': `${settings.progressHeight}px`,
    '--slider-ball-left': `calc(${currentPageGroup} * (100% - var(--divider-width)) / max(${totalPages}, 1) + var(--divider-width)/2)`,
    '--slider-borderhuh': '1px',
    '--divider-width': `${100 / totalPages}%`
  }">
    <div class="progress-wrap" :class="{ active: isDragging, rtl: isRTL }">
      <div class="page-number">
        <span>{{isLoading ? '?' : pageGroups[currentPageGroup]!.map(p => p.pageNum).join('-')}}</span>
      </div>
      <div class="page-slider" :class="{
        rtl: isRTL,
        disabled: props.disabled || isLoading,
        'mx-2': progressSide === ProgressSideEnum.Bottom,
        'my-2': progressSide !== ProgressSideEnum.Bottom,
      }" ref="pageSlider" @mousedown.prevent.stop="startDrag" @touchstart.prevent.stop="startDrag">
        <div id="slider-ball" ref="sliderBall" :class="{
          rtl: isRTL,
          'side left': progressSide === ProgressSideEnum.Left,
          'side right': progressSide === ProgressSideEnum.Right
        }" :style="{ left: sliderPosition }">
          <div class="slider-ball-tooltip" v-if="isDragging" :class="{
            'side left': progressSide === ProgressSideEnum.Left,
            'side right': progressSide === ProgressSideEnum.Right
          }">
            {{isLoading ? '?' : pageGroups[currentPageGroup]!.map(p => p.pageNum).join('-')}}
          </div>
        </div>
        <div v-if="totalPages > 1 && !isLoading" class="slider-dividers" :class="{
          'rtl': isRTL,
          'side left': settings.progressSide === ProgressSideEnum.Left,
          'side right': settings.progressSide === ProgressSideEnum.Right
        }">
          <div v-for="(group, idx) in pageGroups" :key="idx" class="prog-divider" :class="{
            loaded: group.some(p => p.loaded),
            read: currentPageGroup >= idx,
            rtl: isRTL,
            current: currentPageGroup === idx,
            'side left': progressSide === ProgressSideEnum.Left,
            'side right': progressSide === ProgressSideEnum.Right
          }">
            <div class="prog-divider-label" :class="{
              current: currentPageGroup === idx
            }">{{group.map(p => p.pageNum).join('-')}}</div>
          </div>
        </div>
        <div class="slider-loading" v-if="isLoading"></div>
      </div>
      <div class="page-number">{{ isLoading ? '?' : pages.length }}</div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.reader-progress-wrap {
  --padding: 1.5rem;
  --raw-height: 3rem;
  --progress-height: calc(var(--raw-height) + var(--padding));
  --slider-transition: 75ms ease-in-out;
  --slider-height: 1rem;
  --slider-ball-diameter: 1rem;
  --progress-transition: 75ms ease-in-out;
  bottom: 0;
  height: var(--progress-height);
  margin-top: calc(var(--progress-height)*-1);
  overflow: hidden;
  padding-top: var(--padding);
  position: sticky;
}

.reader-progress-wrap.no-anim {
  --progress-transition: 0s;
  --slider-transition: 0s
}

.reader-progress-wrap.normal>.progress-wrap {
  background-color: transparent;
  border-top: 1px solid transparent;
  transform: translateY(calc(var(--raw-height)/2 - var(--slider-height)/2 - .25rem));
}

.reader-progress-wrap.normal>.progress-wrap>.page-slider {
  opacity: .7;
  pointer-events: none;
}

.reader-progress-wrap.normal>.progress-wrap>.page-number {
  max-height: 0;
  max-width: 0;
  min-height: 0;
  min-width: 0;
  transform: scale(0);
}

.reader-progress-wrap.normal.side.left>.progress-wrap {
  transform: translate(calc(var(--raw-height)/-2 + var(--slider-height)/2 + .25rem))
}

.reader-progress-wrap.normal.side.right>.progress-wrap {
  transform: translate(calc(var(--raw-height)/2 - var(--slider-height)/2 - .25rem))
}

.reader-progress-wrap.side {
  bottom: unset;
  height: 100%;
  margin-top: 0;
  max-height: 100vh;
  padding-top: 0;
  top: 0;
  width: var(--progress-height);
  z-index: 1
}

.reader-progress-wrap.side>.progress-wrap {
  border-top: none;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  padding: var(--side-margin) 0;
  transform: translate(0);
  width: var(--raw-height, 3rem)
}

.reader-progress-wrap.side>.progress-wrap>.page-slider {
  height: 100%;
  max-height: 100%;
  width: var(--slider-height)
}

.reader-progress-wrap.side>.progress-wrap>.page-slider>.slider-dividers {
  flex-direction: column
}

.reader-progress-wrap.side.left>.progress-wrap {
  border-right: 1px solid transparent;
  transform: translate(-100%)
}

.reader-progress-wrap.side.right {
  transform: translate(-100%)
}

.reader-progress-wrap.side.right>.progress-wrap {
  border-left: 1px solid transparent;
  margin-left: auto;
  transform: translate(100%)
}

.reader-progress-wrap.side {
  overflow: visible
}

.reader-progress-wrap.web-mobile {
  pointer-events: none
}

.reader-progress-wrap.web-mobile>.progress-wrap {
  pointer-events: all
}

.reader-progress-wrap.mobile {
  --raw-height: var(--bottom-nav-height);
  --slider-height: var(--divider-width);
  --slider-ball-diameter: var(--divider-width);
  pointer-events: none
}

.reader-progress-wrap.mobile>.progress-wrap {
  background-color: transparent;
  pointer-events: all
}

.reader-progress-wrap.show-num>.pg-num {
  opacity: 1;
  transform: translate(-50%) translateY(0)
}

.reader-progress-wrap.normal:not(.mobile):not(.break, :hover) {
  --slider-height: var(--progress-bar-size);
  --slider-ball-diameter: var(--progress-bar-size);
}

.reader-progress-wrap.break,
.reader-progress-wrap:not(.web-mobile):not(.mobile):hover {
  --slider-height: 1rem;
  --slider-ball-diameter: 1rem;
}

.reader-progress-wrap.break.mobile>.progress-wrap,
.reader-progress-wrap:not(.web-mobile):not(.mobile):hover.mobile>.progress-wrap {
  background-color: rgb(var(--mw-background))
}

.reader-progress-wrap.break>.progress-wrap,
.reader-progress-wrap:not(.web-mobile):not(.mobile):hover>.progress-wrap {
  background-color: rgb(var(--mw-background)/.8);
  border-color: rgb(var(--mw-accent));
  transform: none !important
}

@media (min-width:40rem) {

  .reader-progress-wrap.break>.progress-wrap,
  .reader-progress-wrap:not(.web-mobile):not(.mobile):hover>.progress-wrap {
    background-color: rgb(var(--mw-background))
  }
}

.reader-progress-wrap.break>.progress-wrap>.page-slider,
.reader-progress-wrap:not(.web-mobile):not(.mobile):hover>.progress-wrap>.page-slider {
  opacity: 1;
  pointer-events: all
}

.reader-progress-wrap.break>.progress-wrap>.page-number,
.reader-progress-wrap:not(.web-mobile):not(.mobile):hover>.progress-wrap>.page-number {
  max-height: 1rem;
  max-width: 1rem;
  min-height: 1rem;
  min-width: 1rem;
  transform: scale(1)
}

.reader-progress-wrap.break>.pg-num,
.reader-progress-wrap:not(.web-mobile):not(.mobile):hover>.pg-num {
  opacity: 0;
  transform: translate(-50%) translateY(calc(var(--progress-height)*-1))
}

.mw--reader-progress {
  grid-area: progress;
  min-width: 0;
  z-index: 1;
}

.progress-wrap {
  align-items: center;
  background-color: rgb(var(--mw-background)/.8);
  border-top: 1px solid var(--mw-accent);
  display: flex;
  height: var(--raw-height, 3rem);
  padding: 0 var(--side-margin) var(--bottom-nav-padding);
  transform: translateY(100%);
  transition: all var(--progress-transition);
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}

@media (min-width: 40rem) {
  .progress-wrap {
    background-color: rgb(var(--mw-background));
  }
}

.progress-wrap.rtl {
  flex-direction: row-reverse
}

.progress-wrap.active {
  transform: none
}

.progress-wrap.active .slider-ball-tooltip {
  display: block
}

.progress-wrap.thick {
  --slider-height: 2rem
}

.page-number {
  display: flex;
  font-size: .75rem;
  justify-content: center;
  line-height: 1rem;
  min-width: 0;
  transition: all var(--progress-transition);
  white-space: nowrap;
}

.page-slider {
  background-color: rgb(var(--mw-accent));
  border-radius: 9999px;
  cursor: pointer;
  flex-grow: 1;
  height: var(--slider-height);
  min-width: 0;
  position: relative;
  transition: height var(--progress-transition), width var(--progress-transition), opacity var(--progress-transition);
}

#slider-ball {
  align-items: center;
  background-color: var(--ui-primary);
  border-radius: 9999px;
  cursor: grab;
  display: flex;
  font-size: .875rem;
  height: var(--slider-height);
  justify-content: center;
  left: var(--slider-ball-left);
  line-height: 1.25rem;
  min-height: var(--slider-ball-diameter);
  min-width: var(--slider-ball-diameter);
  position: absolute;
  top: 0;
  transform: translate(-50%);
  transition: min-width var(--progress-transition), min-height var(--progress-transition), width var(--progress-transition), height var(--progress-transition);
  width: var(--divider-width);
  z-index: 3;
  --tw-text-opacity: 1;
  color: rgb(255 255 255/var(--tw-text-opacity, 1));
}

#slider-ball.side {
  height: var(--divider-width);
  left: 0;
  top: var(--slider-ball-left);
  transform: translateY(-50%);
  width: var(--slider-height)
}

#slider-ball:active,
#slider-ball:active:after {
  cursor: grabbing
}

#slider-ball.continuous {
  height: var(--slider-ball-diameter);
  max-width: var(--slider-ball-diameter)
}

#slider-ball:not(.side).rtl {
  left: unset;
  right: var(--slider-borderhuh);
  transform: translate(50%)
}

#slider-ball:not(.continuous) {
  transition: left var(--slider-transition), right var(--slider-transition), top var(--slider-transition), min-width var(--progress-transition), min-height var(--progress-transition), height var(--progress-transition), width var(--progress-transition);
}

#slider-ball::after {
  content: " ";
  cursor: grab;
  height: calc(100% + 1rem);
  position: absolute;
  width: calc(100% + 1rem);
}

#slider-ball:hover>.slider-ball-tooltip {
  display: block !important;
}

.slider-ball-tooltip {
  background-color: var(--ui-primary);
  border-radius: 9999px;
  font-size: 1.125rem;
  line-height: 1.75rem;
  line-height: 1;
  padding: .25rem .5rem;
  position: absolute;
  transform: translateY(-100%);
  vertical-align: middle;
  white-space: nowrap;
}

.slider-ball-tooltip.left {
  transform: translate(100%)
}

.slider-ball-tooltip.right {
  transform: translate(-100%)
}


.slider-dividers::before {
  background-color: var(--ui-primary);
  bottom: 0;
  content: "";
  left: 0;
  opacity: .7;
  position: absolute;
  top: 0;
  width: var(--slider-ball-left);
  z-index: 1;
}

@media (min-width: 40rem) {
  .slider-dividers::before {
    border-radius: 9999px;
    z-index: unset;

  }
}

.slider-dividers.side:before {
  bottom: unset;
  height: var(--slider-ball-left);
  right: 0;
  width: auto
}

.slider-dividers:not(.continuous)::before {
  transition: width var(--slider-transition), height var(--slider-transition);
}

.slider-dividers:not(.rtl)>:first-child {
  margin-left: 0;
  padding-left: var(--slider-borderhuh)
}

.slider-dividers:not(.rtl)>:last-child {
  margin-right: 0;
  padding-right: var(--slider-borderhuh)
}

.slider-dividers:not(.side).rtl {
  flex-direction: row-reverse
}

.slider-dividers:not(.side).rtl>:first-child {
  margin-right: 0;
  padding-right: var(--slider-borderhuh)
}

.slider-dividers:not(.side).rtl>:last-child {
  margin-left: 0;
  padding-left: var(--slider-borderhuh)
}

.slider-dividers:not(.side).rtl:before {
  left: unset;
  right: 0
}

.slider-dividers {
  border-radius: 9999px;
  display: flex;
  height: 100%;
  justify-content: space-evenly;
  overflow: hidden;
  position: relative;
}

@media (min-width: 40rem) {
  .slider-dividers {
    overflow: visible;
  }
}

.prog-divider {
  align-items: center;
  background-color: transparent;
  display: flex;
  flex-grow: 1;
  font-size: .75rem;
  height: 100%;
  justify-content: center;
  line-height: 1rem;
  margin: 0 var(--slider-borderhuh);
  position: relative;
  white-space: nowrap;
}

@media (min-width:40rem) {
  .prog-divider.read:after {
    background-color: var(--ui-primary);
    content: " ";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: .7;
    position: absolute;
  }

  .prog-divider.read.current:after {
    bottom: 0;
    height: auto;
    left: 0;
    top: 0;
    width: 50%
  }

  .prog-divider.read.current.rtl:after {
    left: unset;
    right: 0
  }

  .prog-divider.read.current.side:after {
    bottom: unset;
    height: 50%;
    left: 0;
    right: 0;
    top: 0;
    width: auto
  }

  .prog-divider:not(.side):not(.rtl):first-child,
  .prog-divider:not(.side):not(.rtl):first-child:after {
    border-bottom-left-radius: 9999px;
    border-top-left-radius: 9999px
  }

  .prog-divider:not(.side).rtl:first-child,
  .prog-divider:not(.side).rtl:first-child:after,
  .prog-divider:not(.side):not(.rtl):last-child,
  .prog-divider:not(.side):not(.rtl):last-child:after {
    border-bottom-right-radius: 9999px;
    border-top-right-radius: 9999px
  }

  .prog-divider:not(.side).rtl:last-child,
  .prog-divider:not(.side).rtl:last-child:after {
    border-bottom-left-radius: 9999px;
    border-top-left-radius: 9999px
  }

  .prog-divider.side {
    margin: var(--slider-borderhuh) 0
  }

  .prog-divider.side:first-child,
  .prog-divider.side:first-child:after {
    border-top-left-radius: 9999px;
    border-top-right-radius: 9999px
  }

  .prog-divider.side:last-child,
  .prog-divider.side:last-child:after {
    border-bottom-left-radius: 9999px;
    border-bottom-right-radius: 9999px
  }
}

.prog-divider.loading {
  background-color: rgb(var(--mw-accent))
}

.prog-divider.error {
  background-color: rgb(var(--mw-status-red));
  z-index: 2
}

.prog-divider.loaded {
  background-color: rgb(var(--mw-accent-20))
}

.prog-divider.continuous {
  margin: 0;
  transition: background-color var(--slider-transition)
}

.prog-divider:hover>:not(.current).prog-divider-label {
  display: block
}

.prog-divider-label {
  background-color: rgb(var(--mw-accent));
  border-radius: 9999px;
  bottom: calc(100% + .5rem);
  display: none;
  font-size: 1.125rem;
  line-height: 1.75rem;
  line-height: 1;
  padding: .25rem .5rem;
  position: absolute;
  vertical-align: middle;
  white-space: nowrap
}

.prog-divider-label.left {
  bottom: unset;
  left: calc(100% + .5rem);
  right: unset
}

.prog-divider-label.right {
  bottom: unset;
  left: unset;
  right: calc(100% + .5rem)
}
</style>