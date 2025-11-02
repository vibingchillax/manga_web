<script setup lang="ts">
import { useResizeObserver, useDebounceFn } from "@vueuse/core";

const props = defineProps<{
  small?: boolean;
  targetHeight?: number;
  extraText?: string;
  extraTextClass?: string;
}>();

const elem = useTemplateRef("text");

const smallSizes = ["1.5rem", "1.3125rem", "1rem", "0.875rem"];
const normalSizes = [
  "4.5rem",
  "4rem",
  "3.5rem",
  "3rem",
  "2.5rem",
  "2rem",
  "1.75rem",
  ...smallSizes,
];

const requestFrame =
  window.requestAnimationFrame ??
  ((cb: FrameRequestCallback) => window.setTimeout(cb, 1000 / 60));

const state = {
  lock: false,
  size: 0,
  lastSize: -1,
};

const resizeText = async () => {
  if (state.lock) return;
  const el = elem.value;
  if (!el || !el.parentElement) return;

  const parentRect = el.parentElement.getBoundingClientRect();
  let extraHeight = 0;

  if (props.extraText) {
    const temp = document.createElement("div");
    temp.className = props.extraTextClass || "";
    temp.style.width = parentRect.width + "px";
    temp.innerText = props.extraText;
    temp.style.position = "fixed";
    temp.style.visibility = "hidden";
    document.body.appendChild(temp);
    extraHeight = temp.getBoundingClientRect().height;
    temp.remove();
  }

  let siblingsHeight = 0;
  const siblings = el.parentElement.children;
  for (let i = 0; i < siblings.length; i++) {
    const sib = siblings[i] as HTMLElement;
    if (sib === el) continue;
    if (!sib.textContent && getComputedStyle(sib).flexGrow === "1") continue;
    siblingsHeight += sib.getBoundingClientRect().height;
  }

  const availableHeight =
    (props.targetHeight ?? parentRect.height) - extraHeight - siblingsHeight;

  if (parentRect.width * availableHeight <= state.lastSize) {
    state.lastSize = parentRect.width * availableHeight;
    if (
      el.scrollHeight <= availableHeight &&
      el.scrollWidth <= parentRect.width
    )
      return;
  }

  state.lock = true;
  state.lastSize = parentRect.width * availableHeight;

  const markerClass = "__bigtext_target";
  el.classList.add(markerClass);
  const cloneParent = el.parentElement.cloneNode(true) as HTMLElement;
  el.classList.remove(markerClass);

  cloneParent.style.position = "fixed";
  cloneParent.style.visibility = "hidden";
  cloneParent.style.left = -(parentRect.width * 2) + "px";
  cloneParent.style.top = -(availableHeight * 2) + "px";
  cloneParent.style.width = parentRect.width + "px";
  cloneParent.style.height = availableHeight + "px";

  const cloneTarget = cloneParent.querySelector(
    `.${markerClass}`,
  ) as HTMLElement;
  cloneTarget.style.width = "auto";
  document.body.appendChild(cloneParent);

  const sizes = props.small ? smallSizes : normalSizes;
  for (state.size = 0; state.size < sizes.length - 1; state.size++) {
    cloneTarget.style.fontSize = sizes[state.size]!;
    if (
      cloneTarget.scrollHeight <= Math.ceil(availableHeight) &&
      cloneTarget.scrollWidth <= Math.ceil(parentRect.width)
    )
      break;
  }

  el.style.fontSize = sizes[state.size]!;

  const baseHeight = cloneTarget.scrollHeight;
  let currentWidth = cloneTarget.scrollWidth;
  const step = window.innerWidth / 15;
  while (currentWidth > 0) {
    cloneTarget.style.width = currentWidth - step + "px";
    if (cloneTarget.scrollHeight !== baseHeight) break;
    currentWidth -= step;
  }
  el.style.width = currentWidth + "px";

  cloneParent.remove();
  state.lock = false;
};

const debouncedResize = useDebounceFn(resizeText, 1000 / 15);

onMounted(() => {
  if (elem.value?.parentElement)
    useResizeObserver(elem.value.parentElement, debouncedResize);

  requestFrame(resizeText);
});

const { menuActive } = storeToRefs(useLayout());
watch(menuActive, () => setTimeout(resizeText, 250));
</script>
<template>
  <p ref="text" style="line-height: 1.1em; overflow-wrap: break-word">
    <slot />
  </p>
</template>
