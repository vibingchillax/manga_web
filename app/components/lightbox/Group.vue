<script lang="ts">
export interface LightboxRegistration {
  next: ComputedRef<(() => void) | null>;
  prev: ComputedRef<(() => void) | null>;
  openCb: (isOpen: boolean) => void;
  unregister: () => void;
}

export type LightboxStateCallback = (isOpen: boolean) => void;

export interface LightboxChildInstance {
  $el: HTMLElement | Element;
}

export type LightboxRegisterFn = (
  childInstance: LightboxChildInstance,
  stateCallback: LightboxStateCallback,
) => LightboxRegistration;

export const LightboxKey: InjectionKey<LightboxRegisterFn> =
  Symbol("LightboxKey");
</script>
<script setup lang="ts">
const elements: LightboxChildInstance[] = [];
const callbacks: LightboxStateCallback[] = [];
const states = ref<boolean[]>([]);

const isAnyOpen = computed(() => states.value.some((s) => s));

const register: LightboxRegisterFn = (childInstance, stateCallback) => {
  let index = 0;
  //type guarding doesn't do that well, so we temporarily ignore it
  while (
    index < elements.length &&
    !(
      elements[index].$el.compareDocumentPosition(childInstance.$el) &
      Node.DOCUMENT_POSITION_PRECEDING
    )
  ) {
    index++;
  }

  elements.splice(index, 0, childInstance);
  callbacks.splice(index, 0, stateCallback);
  states.value.splice(index, 0, false);

  const getIndex = () => elements.indexOf(childInstance);

  const navigate = (direction: number) => {
    const currentIdx = getIndex();
    states.value[currentIdx] = false;

    const newIdx = currentIdx + direction;

    if (newIdx >= 0 && newIdx < states.value.length) {
      states.value[newIdx] = true;
      callbacks.forEach((cb, i) => cb(i === newIdx));
      states.value = [...states.value];
    }
  };

  return {
    prev: computed(() => {
      return getIndex() > 0 ? () => navigate(-1) : null;
    }),
    next: computed(() => {
      return getIndex() < states.value.length - 1 ? () => navigate(1) : null;
    }),
    openCb: (isOpen: boolean) => {
      const currentIdx = getIndex();
      if (currentIdx === -1) return;

      if (isOpen) {
        states.value = states.value.map((s, i) => {
          const isTarget = i === currentIdx;
          if (isTarget !== s) callbacks[i](isTarget);
          return isTarget;
        });
      } else {
        states.value[currentIdx] = false;
        callbacks[currentIdx](false);
      }
    },
    unregister: () => {
      const idx = getIndex();
      if (idx > -1) {
        elements.splice(idx, 1);
        callbacks.splice(idx, 1);
        states.value.splice(idx, 1);
      }
    },
  };
};

provide(LightboxKey, register);
</script>
<template>
  <div :class="{ shade: isAnyOpen }">
    <slot />
  </div>
</template>
<style lang="css" scoped>
.shade:before {
  background-color: rgb(var(--mw-accent-10));
  content: "";
  display: block;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0.9;
  position: fixed;
  z-index: 100;
}
</style>
