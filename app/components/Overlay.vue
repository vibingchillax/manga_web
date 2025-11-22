<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    zIndex?: string | number;
    opacity?: string | number;
    attach?: string | HTMLElement | null;
  }>(),
  {
    zIndex: 100,
    opacity: 0.7,
    attach: null,
  },
);

const emit = defineEmits(["click"]);

function onClick(event: PointerEvent) {
  emit("click", event);
}

const overlayStyle = computed(() => ({
  "--overlay-opacity": props.opacity,
  zIndex: props.zIndex,
}));
</script>
<template>
  <Teleport :to="attach || 'body'" :disabled="!attach && attach !== undefined">
    <div
      ref="content"
      class="mw-overlay text-white p-8 flex flex-col items-center justify-center"
      :style="[{ zIndex }, overlayStyle]"
      @click="onClick"
    >
      <slot />
    </div>
  </Teleport>
</template>
<style lang="css" scoped>
.mw-overlay {
  position: fixed;
}

.mw-overlay,
.mw-overlay:before {
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
}

.mw-overlay:before {
  background-color: rgb(var(--mw-accent-10));
  content: "";
  display: block;
  opacity: var(--overlay-opacity);
  position: absolute;
  z-index: -1;
}
</style>
