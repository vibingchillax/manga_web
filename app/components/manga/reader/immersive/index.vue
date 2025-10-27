<script setup lang="ts">
import { ReadStyleEnum } from '~/stores/useReaderMenu'

const router = useRouter()

const reader = useReaderStore()
const pageManager = useReaderPageManager()
const settings = useReaderMenu()

const { setImmersive, incrementPageGroup } = reader
const { chapterMeta, immersionBreak } = storeToRefs(reader)

const { toggleMenuOpen } = settings
const { readStyle } = storeToRefs(settings)


function exitImmersive() {
  setImmersive(false)
}
</script>
<template>
  <div>
    <div class="t l reader--immersive-buttons" :class="{ break: immersionBreak }"
      @click.prevent.stop="() => incrementPageGroup(-1, router, readStyle === ReadStyleEnum.LTR)">
      {{ readStyle === ReadStyleEnum.LTR ? 'Prev' : 'Next' }}
      <UIcon size="size-10" color="white" name="i-lucide-circle-arrow-left" />
    </div>

    <div class="b l reader--immersive-buttons" :class="{ break: immersionBreak }"
      @click.prevent.stop="exitImmersive">
      <UIcon size="size-10" color="white" name="i-lucide-x" />
      Exit
    </div>

    <div class="t r reader--immersive-buttons" :class="{ break: immersionBreak }"
      @click.prevent.stop="() => incrementPageGroup(1, router, readStyle === ReadStyleEnum.LTR)">
      {{ readStyle === ReadStyleEnum.LTR ? 'Next' : 'Prev' }}
      <UIcon size="size-10" color="white" name="i-lucide-circle-arrow-right" />
    </div>

    <div class="b r reader--immersive-buttons" :class="{ break: immersionBreak }"
      @click.prevent.stop="toggleMenuOpen && toggleMenuOpen()">
      <UIcon size="size-10" color="white" name="i-lucide-menu" />
      Menu
    </div>
  </div>
</template>
<style lang="css" scoped>
.reader--immersive-buttons {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  height: 10rem;
  justify-content: center;
  opacity: 0;
  position: fixed;
  text-shadow: 0 2px 1px rgba(0, 0, 0, .73), 0 1px 3px rgba(0, 0, 0, .73);
  transition: all 75ms ease-out;
  width: 10rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255/var(--tw-text-opacity, 1))
}

.reader--immersive-buttons.break,
.reader--immersive-buttons:hover {
  opacity: 1
}

.reader--immersive-buttons.break {
  height: 13rem;
  width: 13rem
}

.reader--immersive-buttons:before {
  box-shadow: 0 0 200px 150px #000000b3;
  content: " ";
  position: absolute;
  z-index: -1
}

.reader--immersive-buttons.l,
.reader--immersive-buttons.l:before {
  left: 0
}

.reader--immersive-buttons.r,
.reader--immersive-buttons.r:before {
  right: 0
}

.reader--immersive-buttons.t,
.reader--immersive-buttons.t:before {
  top: 0
}

.reader--immersive-buttons.b,
.reader--immersive-buttons.b:before {
  bottom: 0
}
</style>