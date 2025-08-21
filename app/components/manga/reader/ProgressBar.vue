<script setup lang="ts">
const store = useScrapedReaderStore();
const currentPage = computed(() => store.currentPage);
const totalPages = computed(() => store.totalPages);
</script>

<template>
  <div class="reader-progress-wrap normal mw--reader-progress" :style="{
    '--slider-heighthuh': '4px',
    '--slider-ball-left': `calc(${currentPage} * (100% - var(--divider-width)) / max(${totalPages - 1}, 1) + var(--divider-width)/2)`,
    '--slider-borderhuh': '1px',
    '--divider-width': `${100 / totalPages}%`
  }">
    <div class="progress-wrap">
      <div class="page-number">
        {{ currentPage + 1 }}
      </div>
      <div class="page-slider mx-2">
        <div id="slider-ball">
          <div class="slider-ball-tooltip" style="display: none;">
            {{ currentPage + 1 }}
          </div>
        </div>
        <div class="slider-dividers" v-if="totalPages > 1">
          <div v-for="i in totalPages" :key=i class="prog-divider loaded" :class="{
            read: i - 1 <= currentPage,
            current: i - 1 === currentPage
          }" @click="store.currentPage = i - 1">
            <div class="prog-divider-label">{{ i }}</div>
          </div>
        </div>
      </div>
      <div class="page-number">
        {{ totalPages }}
      </div>
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
  --slider-height: var(--slider-heighthuh);
  --slider-ball-diameter: var(--slider-heighthuh);
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
  height: var(--slider-heighthuh);
  left: 0;
  top: var(--slider-borderhuh);
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