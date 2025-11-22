<script setup lang="ts">
import { LightboxKey } from "./Group.vue";

interface Props {
  src?: string;
  fullRes?: string;
}

const props = defineProps<Props>();
const open = defineModel<boolean>("open", { required: true });

const elRef = ref<HTMLElement | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);
const arrowOverlayRef = ref<HTMLElement | null>(null);

const isLoading = ref(true);
const isVisible = ref(false);
const {
  x: imgX,
  y: imgY,
  width: imgW,
  height: imgH,
} = useElementBounding(imgRef);

const lightboxRegister = inject(LightboxKey, null);

const nextFn = ref<(() => void) | null>(null);
const prevFn = ref<(() => void) | null>(null);
const registerFn = ref<((isOpen: boolean) => void) | null>(null);
const unregisterFn = ref<(() => void) | null>(null);

const close = () => {
  open.value = false;
};

const onImageLoad = () => {
  isLoading.value = false;
};

defineShortcuts({
  arrowleft: () => {
    prevFn.value?.();
  },
  arrowright: () => {
    nextFn.value?.();
  },
  escape: () => {
    open.value = false;
  },
});

const preventGhostClick = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent && "button" in e && e.button !== 2) return;

  const el = arrowOverlayRef.value;
  if (el) {
    el.style.pointerEvents = "none";
    requestAnimationFrame(() => {
      el.style.pointerEvents = "auto";
    });
  }
};

const openFullRes = () => {
  // if (props.fullRes) window.open(props.fullRes, "_blank");
  // ^ nah, users can right click
};

watch(
  open,
  (val) => {
    registerFn.value?.(val);

    nextTick(() => {
      isVisible.value = val;
    });
  },
  { immediate: true },
);

onMounted(() => {
  if (lightboxRegister && elRef.value) {
    const registered = lightboxRegister(
      { $el: elRef.value },
      (isOpen: boolean) => {
        isLoading.value = isOpen;
        open.value = isOpen;
      },
    );

    watch(
      registered.next,
      (newNext) => {
        nextFn.value = newNext;
      },
      { immediate: true },
    );

    watch(
      registered.prev,
      (newPrev) => {
        prevFn.value = newPrev;
      },
      { immediate: true },
    );
    registerFn.value = registered.openCb;
    unregisterFn.value = registered.unregister;
  }
});

onBeforeUnmount(() => {
  unregisterFn.value?.();
});
</script>
<template>
  <div ref="elRef">
    <Overlay
      v-if="open"
      :attach="'body'"
      @click="close"
      :opacity="registerFn ? '0' : undefined"
    >
      <Transition name="fade">
        <div
          v-if="isVisible"
          class="w-full h-full flex justify-center items-center relative"
        >
          <div class="w-full h-full flex justify-center items-center relative">
            <div
              v-if="isLoading"
              class="rounded shadow-md image-placeholder"
            ></div>

            <NuxtImg
              v-show="!isLoading"
              ref="imgRef"
              :src="fullRes || src"
              alt="Cover image"
              class="max-w-full max-h-full transition-opacity"
              :class="{ 'fixed left-full top-full w-0 h-0': isLoading }"
              @click.stop="openFullRes"
              @load="onImageLoad"
            />
          </div>
        </div>
      </Transition>

      <div
        v-if="registerFn"
        class="arrow-overlay absolute"
        ref="arrowOverlayRef"
        @mouseup.stop="preventGhostClick"
        @touchstart.stop="preventGhostClick"
        :style="{
          left: `${imgX}px`,
          top: `${imgY}px`,
          width: `${imgW}px`,
          height: `${imgH}px`,
        }"
      >
        <div v-if="prevFn" class="arrow left" @click.stop="prevFn">
          <UIcon name="i-lucide-chevron-left" />
        </div>

        <div v-if="nextFn" class="arrow right" @click.stop="nextFn">
          <UIcon name="i-lucide-chevron-right" />
        </div>
      </div>
    </Overlay>
  </div>
</template>
<style lang="css" scoped>
.image-placeholder {
  height: calc(100vh - 4rem);
  width: calc(70.71vh - 2.8284rem);
}

@media (max-aspect-ratio: 169/239) {
  .image-placeholder {
    height: calc(141.4vw - 5.656rem);
    width: calc(100vw - 4rem);
  }
}

.arrow-overlay {
  position: fixed;
  z-index: 1000;
}

.arrow {
  align-items: center;
  bottom: 0;
  cursor: pointer;
  display: flex;
  font-size: 4rem;
  justify-content: flex-start;
  position: absolute;
  top: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  width: 50%;
}

.arrow.left {
  background: radial-gradient(farthest-side at left, #00000080, #0000);
  left: 0;
}

.arrow.right {
  background: radial-gradient(farthest-side at right, #00000080, #0000);
  flex-direction: row-reverse;
  right: 0;
}

.arrow > * {
  filter: drop-shadow(0 0 2px #000);
}

.arrow {
  opacity: 0;
  transition: opacity 0.2s ease-out;
}

.arrow:hover {
  opacity: 1;
}
</style>
