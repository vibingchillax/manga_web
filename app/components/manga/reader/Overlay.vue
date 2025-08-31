<script setup lang="ts">
import { CursorHintsEnum, ReadStyleEnum } from '~/stores/useReaderMenu';

const reader = useReaderStore();
const router = useRouter();
const { cursorHints, readStyle, menuOpen} = storeToRefs(useReaderMenu());

const leftActive = ref(false);
const rightActive = ref(false);
const mouseDisabled = ref(false);
const overlayRef = ref<HTMLElement | null>(null);

const LEFT_THRESHOLD = 0.3;
const RIGHT_THRESHOLD = 0.7;

const labels = computed(() => {
  switch (readStyle.value) {
    case ReadStyleEnum.LTR:
      return ['Prev', 'Next'];
    case ReadStyleEnum.RTL:
      return ['Next', 'Prev'];
    default:
      return ['Prev', 'Next'];
  }
});

const handleMouseMove = (event: MouseEvent) => {
  if (mouseDisabled.value || !overlayRef.value) return;

  const rect = overlayRef.value.parentElement!.getBoundingClientRect();
  const relativeX = (event.clientX - rect.left) / rect.width;

  leftActive.value = relativeX < LEFT_THRESHOLD;
  rightActive.value = relativeX > RIGHT_THRESHOLD;
};

const handleMouseLeave = () => {
  leftActive.value = false;
  rightActive.value = false;
  mouseDisabled.value = true;
};

const handleMouseEnter = (event: MouseEvent) => {
  handleMouseMove(event);
  mouseDisabled.value = false;
};

onMounted(() => {
  if (!overlayRef.value) return;

  window.addEventListener('mousemove', handleMouseMove);
  overlayRef.value.parentElement?.addEventListener('mouseleave', handleMouseLeave);
  overlayRef.value.parentElement?.addEventListener('mouseenter', handleMouseEnter);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  overlayRef.value?.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
  overlayRef.value?.parentElement?.removeEventListener('mouseenter', handleMouseEnter);
});
</script>

<template>
  <div v-if="cursorHints === CursorHintsEnum.Overlay" ref="overlayRef"
    class="sticky bottom-0 left-0 w-full flex justify-center items-end">
    <div class="reader--page-overlay left" :class="{ show: leftActive }" :style="{ width: `${LEFT_THRESHOLD * 100}%` }"
    @click="reader.incrementPageGroup(-1, router, readStyle === ReadStyleEnum.LTR)"
    >
      {{ labels[0] }}
      <Icon name="arrowLeftCircle" size="large" color="white" />
    </div>

    <div class="reader--page-overlay center" :style="{ width: `${(RIGHT_THRESHOLD - LEFT_THRESHOLD) * 100}%` }"
    @click="menuOpen = !menuOpen"
    >
      Menu
      <Icon name="menu" size="large" color="white" />
    </div>

    <div class="reader--page-overlay right" :class="{ show: rightActive }"
      :style="{ width: `${(1 - RIGHT_THRESHOLD) * 100}%` }"
      @click="reader.incrementPageGroup(1, router, readStyle === ReadStyleEnum.LTR)"
      >
      {{ labels[1] }}
      <Icon name="arrowRightCircle" size="large" color="white" />
    </div>
  </div>
</template>

<style scoped>
.reader--page-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 80px;
  transition: background 0.2s;
}

.reader--page-overlay.show {
  background: rgba(255, 255, 255, 0.1);
}

.reader--page-overlay.left {
  text-align: left;
}

.reader--page-overlay.right {
  text-align: right;
}

.reader--page-overlay.center {
  text-align: center;
}
</style>
