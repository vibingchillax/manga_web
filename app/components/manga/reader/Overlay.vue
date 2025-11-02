<script setup lang="ts">
import { CursorHintsEnum, ReadStyleEnum } from "~/stores/useReaderMenu";

const reader = useReaderStore();
const router = useRouter();
const { cursorHints, readStyle, menuOpen } = storeToRefs(useReaderMenu());

const leftActive = ref(false);
const rightActive = ref(false);
const mouseDisabled = ref(false);
const overlayRef = ref<HTMLElement | null>(null);

const LEFT_THRESHOLD = 0.3;
const RIGHT_THRESHOLD = 0.7;

const labels = computed(() => {
  switch (readStyle.value) {
    case ReadStyleEnum.LTR:
      return ["Prev", "Next"];
    case ReadStyleEnum.RTL:
      return ["Next", "Prev"];
    default:
      return ["Prev", "Next"];
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

  window.addEventListener("mousemove", handleMouseMove);
  overlayRef.value.parentElement?.addEventListener(
    "mouseleave",
    handleMouseLeave,
  );
  overlayRef.value.parentElement?.addEventListener(
    "mouseenter",
    handleMouseEnter,
  );
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);
  overlayRef.value?.parentElement?.removeEventListener(
    "mouseleave",
    handleMouseLeave,
  );
  overlayRef.value?.parentElement?.removeEventListener(
    "mouseenter",
    handleMouseEnter,
  );
});
</script>

<template>
  <div
    v-if="cursorHints === CursorHintsEnum.Overlay"
    ref="overlayRef"
    class="sticky bottom-0 left-0 w-full flex justify-center items-end"
  >
    <div
      class="reader--page-overlay left"
      :class="{ show: leftActive }"
      :style="{ width: `${LEFT_THRESHOLD * 100}%` }"
      @click="
        reader.incrementPageGroup(-1, router, readStyle === ReadStyleEnum.LTR)
      "
    >
      {{ labels[0] }}
      <UIcon name="i-lucide-circle-arrow-left" size="size-10" color="white" />
    </div>

    <div
      class="reader--page-overlay center"
      :style="{ width: `${(RIGHT_THRESHOLD - LEFT_THRESHOLD) * 100}%` }"
      @click="menuOpen = !menuOpen"
    >
      Menu
      <UIcon name="i-lucide-menu" size="size-10" color="white" />
    </div>

    <div
      class="reader--page-overlay right"
      :class="{ show: rightActive }"
      :style="{ width: `${(1 - RIGHT_THRESHOLD) * 100}%` }"
      @click="
        reader.incrementPageGroup(1, router, readStyle === ReadStyleEnum.LTR)
      "
    >
      {{ labels[1] }}
      <UIcon name="i-lucide-circle-arrow-right" size="size-10" color="white" />
    </div>
  </div>
</template>
<style lang="css" scoped>
.reader--page-overlay {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 0;
  justify-content: flex-end;
  margin-top: -9999px;
  opacity: 0;
  position: relative;
  transition: all 75ms ease-out;
  z-index: 1;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.reader--page-overlay.left {
  align-items: flex-start;
  justify-self: start;
}

.reader--page-overlay.left:before {
  left: 0;
  position: absolute;
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));
}

.reader--page-overlay.right {
  align-items: flex-end;
  justify-self: end;
}

.reader--page-overlay.right:before {
  position: absolute;
  right: 0;
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));
}

.reader--page-overlay.show {
  height: 30%;
  opacity: 1;
  padding: 2rem;
}

.reader--page-overlay.show:before {
  box-shadow: 0 0 300px 250px #000;
}

.reader--page-overlay:before {
  bottom: 0;
  box-shadow: 0 0 #000;
  content: " ";
  position: absolute;
  transition: all 75ms ease-out;
  width: 40px;
  z-index: -1;
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));
  opacity: 0.7;
}
</style>
