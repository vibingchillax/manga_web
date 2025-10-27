<script setup lang="ts">
import { useMouse, useTimeoutFn, useEventListener } from '@vueuse/core'
import { useReaderMenu, CursorHintsEnum, ReadStyleEnum, TurnPagesEnum } from '~/stores/useReaderMenu'

const HIDE_DELAY = 1500

const parent = ref<HTMLElement>()
const icon = ref('')
const visible = ref(true)
const active = ref(true)

const { x: clientX, y: clientY } = useMouse()

const { turnPages, readStyle, cursorHints } = storeToRefs(useReaderMenu())
const showCursor = computed(() => cursorHints.value === CursorHintsEnum.Cursor)

const { start: startHideTimer, stop: stopHideTimer } = useTimeoutFn(() => {
  active.value = false
  parent.value?.parentElement?.style && (parent.value.parentElement.style.cursor = 'none')
}, HIDE_DELAY)

const setCursor = (hidden: boolean) => {
  const el = parent.value?.parentElement
  if (!el) return
  el.style.cursor = hidden ? 'none' : 'pointer'
}

const updateCursor = (e: MouseEvent) => {
  stopHideTimer()
  startHideTimer()

  const el = parent.value?.parentElement
  if (!el) return

  active.value = true

  const rect = el.getBoundingClientRect()
  const relativeX = (e.clientX - rect.left) / rect.width
  const arrowRight = readStyle.value === ReadStyleEnum.RTL ? 'i-lucide-circle-arrow-left' : 'i-lucide-circle-arrow-right'

  switch (turnPages.value) {
    case TurnPagesEnum.Directional:
      icon.value =
        relativeX < 0.33 ? 'i-lucide-circle-arrow-left'
        : relativeX > 0.66 ? 'i-lucide-circle-arrow-right'
        : 'menuCircle'
      break
    case TurnPagesEnum.None:
    default:
      icon.value =
        relativeX < 0.33 || relativeX > 0.66 ? 'i-lucide-circle' : 'i-lucide-circle-equal'
      break
  }

  visible.value = showCursor.value && relativeX > 0 && relativeX < 1
}

useEventListener(window, 'mousemove', updateCursor)
useEventListener(window, 'mousedown', () => {
  stopHideTimer()
  startHideTimer()
})
useEventListener(parent, 'mouseleave', () => {
  visible.value = false
  stopHideTimer()
})
useEventListener(parent, 'mouseenter', () => {
  visible.value = showCursor.value
  setCursor(visible.value)
})

watch(visible, (v) => setCursor(v), { immediate: true })
</script>
<template>
  <div ref="parent">
    <div
      v-if="cursorHints === CursorHintsEnum.Cursor"
      v-show="visible"
      class="cursor"
      :class="{ fade: !active }"
      :style="{ '--cl': `${clientX}px`, '--ct': `${clientY}px` }"
    >
      <UIcon v-if="icon" :name="icon" />
    </div>
  </div>
</template>
<style lang="css" scoped>
.cursor {
  color: rgb(255 255 255/var(--tw-text-opacity, 1));
  filter: drop-shadow(3px 5px 5px rgb(0 0 0/.8));
  left: var(--cl);
  pointer-events: none;
  position: fixed;
  top: var(--ct);
  transform: translate(-50%, -50%);
  z-index: 100
}

.cursor,
.cursor.dark {
  --tw-text-opacity: 1
}

.cursor.dark {
  color: rgb(0 0 0/var(--tw-text-opacity, 1));
  filter: drop-shadow(3px 5px 5px rgb(255 255 255/.8))
}

.cursor.fade {
  opacity: 0;
  transition: opacity .2s ease-out
}

.cursor>* {
  height: 3rem;
  width: 3rem
}
</style>