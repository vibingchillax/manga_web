<script setup lang="ts">
import { UploadState } from "~~/shared/types";

const props = defineProps<{
  input?: string | null;
  disabled?: boolean;
  compact?: boolean;
  dragging?: boolean;
  isDuplicate?: boolean;
  id?: string | number;
  preview?: string;
  fileName?: string;
  failReason?: string;
  message?: string;
  progress?: number;
  state?: UploadState;
  noDrag?: boolean;
}>();

const emit = defineEmits<{
  (e: "editClick"): void;
  (e: "remove", id?: string | number): void;
}>();

const { $breakpoints } = useNuxtApp();

const showPreview = ref(false);

function handleClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest(".edit-page")) return;
  if (props.input || !props.preview || props.dragging) return;
  showPreview.value = !showPreview.value;
}
</script>
<template>
  <component
    :is="input ? 'label' : 'div'"
    :for="input"
    class="page"
    :class="{
      placeholder: input || dragging,
      dragging,
      compact,
    }"
    :style="{
      backgroundImage:
        !compact && preview && !dragging ? `url(${preview})` : undefined,
    }"
    @click="handleClick"
  >
    <template v-if="dragging" />
    <template v-else-if="input">
      <UIcon name="i-lucide-plus" />
    </template>
    <template v-else>
      <div v-if="fileName" class="label" :title="fileName">
        {{ fileName }}
      </div>

      <div
        v-if="state !== UploadState.Fail && message && !input"
        class="info-icon"
      >
        <UTooltip :disabled="!message" :text="message">
          <UButton
            size="xs"
            variant="soft"
            class="rounded-full"
            color="neutral"
            icon="i-lucide-info"
          />
        </UTooltip>
      </div>

      <div class="flex flex-col gap-2 absolute -top-2 -left-2">
        <label
          v-if="!disabled && !input"
          for="edit-file"
          class="edit-page relative"
          @click="$emit('editClick')"
        >
          <div class="md:hidden h-10 w-10" />
          <div
            class="w-6 h-6 rounded-full bg-accent-20 text-white flex items-center justify-center transition-colors duration-150 ease-out hover:cursor-pointer hover:bg-accent-20-hover"
            :class="{ 'absolute top-0 left-0': !$breakpoints.md.value }"
          >
            <UButton
              size="xs"
              variant="soft"
              color="neutral"
              class="rounded-full"
              icon="i-lucide-pencil"
            />
          </div>
        </label>

        <UTooltip
          v-if="state === UploadState.Fail && !input"
          :disabled="!failReason"
          :text="failReason"
        >
          <div
            class="rounded-full text-white relative w-6 h-6 bg-danger flex justify-center items-center"
          >
            <UButton
              size="xs"
              variant="soft"
              color="neutral"
              icon="i-lucide-file-warning"
              class="rounded-xl"
            />
          </div>
        </UTooltip>
      </div>

      <div
        v-if="!disabled && !input"
        class="close"
        @click.stop="$emit('remove', id)"
      >
        <div v-if="!$breakpoints.md.value" class="over-box" />
        <div class="icon-container">
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            class="rounded-full"
            icon="i-lucide-x"
          />
        </div>
      </div>

      <div v-if="!input && !noDrag" class="middle">
        <UButton
          v-if="state === UploadState.Fail"
          color="error"
          icon="i-lucide-x"
        />
        <Loading
          v-else-if="
            state === UploadState.Pending || state === UploadState.Uploading
          "
          color="primary"
          :compact="compact"
        />
        <UIcon
          v-else-if="disabled && state === UploadState.Success"
          color="green"
          name="i-lucide-check"
        />
        <Loading v-else-if="disabled" color="primary" />
        <UIcon v-else color="black" name="i-lucide-move" />
      </div>

      <div v-if="isDuplicate" class="duplicate">Duplicate</div>
    </template>

    <Lightbox v-if="preview" v-model:open="showPreview" :src="preview" />
  </component>
</template>

<style lang="css" scoped>
.placeholder {
  display: block;
  height: 80px;
  margin: auto;
  position: relative;
  width: 80px;
}

.placeholder div {
  animation: lds-ripple 2.5s ease-in-out infinite;
  background: rgb(var(--mw-primary));
  border-radius: 50%;
  opacity: 1;
  position: absolute;
}

.placeholder div:nth-child(2) {
  animation-delay: -1.25s;
}

@keyframes lds-ripple {
  0% {
    height: 0;
    left: 36px;
    opacity: 1;
    top: 36px;
    width: 0;
  }

  to {
    height: 72px;
    left: 0;
    opacity: 0;
    top: 0;
    width: 72px;
  }
}

@keyframes wiggle {
  0% {
    transform: rotate(2deg);
  }

  50% {
    transform: rotate(-2deg);
  }

  to {
    transform: rotate(2deg);
  }
}

.page {
  align-items: center;
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: contain;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: 184px;
  justify-content: center;
  position: relative;
  transition: all 0.15s ease-out;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  width: 130px;
}

.page.compact {
  height: 4.25rem;
}

.page.compact > .middle {
  border-radius: 0.5rem;
  height: 2rem;
  left: 0.5rem;
  right: 0.5rem;
  top: 0.25rem;
  transform: none;
  width: auto;
}

.page.compact > .duplicate {
  bottom: auto;
  left: 50%;
  top: -0.875rem;
  transform: translate(-50%);
}

.page.placeholder {
  border: 1px dashed #4d4d4d;
}

.page.placeholder:hover {
  background-color: rgb(var(--mw-accent));
}

.page:not(.placeholder) {
  box-shadow: 0 4px 16px #0003;
}

.page.dragging {
  animation: wiggle-8c173c17 0.3s ease-in-out infinite;
}

.page > .label {
  border-radius: 11px;
  bottom: 4px;
  font-size: 0.75rem;
  left: 4px;
  max-width: calc(100% - 8px);
  overflow: hidden;
  padding: 2px 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
}

.page > .info-icon,
.page > .label {
  background-color: rgb(var(--mw-accent-20));
  position: absolute;
}

.page > .info-icon {
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: 16px;
  justify-content: center;
  right: -4px;
  top: -4px;
  width: 16px;
}

.page > .close > .over-box {
  height: 2.5rem;
  width: 2.5rem;
}

.page > .close > .icon-container {
  align-items: center;
  aspect-ratio: 1/1;
  background-color: rgb(var(--mw-accent-20));
  border-radius: 50%;
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0;
  transition: background-color 0.15s ease-out;
}

.page > .close:hover > .icon-container {
  background-color: #4d4d4d;
  cursor: pointer;
}

.page > .close {
  --button-size: 24px;
  position: absolute;
  right: calc(var(--button-size) / -3);
  top: calc(var(--button-size) / -3);
}

.page > .close > .icon-container {
  height: var(--button-size);
  right: 0;
  width: var(--button-size);
}

.page > .info-icon {
  height: 24px;
  left: -4px;
  right: auto;
  width: 24px;
}

.page > .info-icon .trigger {
  display: flex;
}

.page > .info-icon {
  background-color: rgb(var(--mw-accent-50));
}

.page > .middle {
  align-items: center;
  background-color: #fff;
  border-radius: 50%;
  color: #4d4d4d;
  display: flex;
  height: 2.75rem;
  justify-content: center;
  left: 50%;
  opacity: 0.8;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2.75rem;
}

.page > .duplicate {
  background-color: rgb(var(--mw-danger));
  border-radius: 0.75rem;
  bottom: 1.725rem;
  font-size: 0.825rem;
  left: 0.25rem;
  padding: 0.125rem 0.5rem;
  position: absolute;
}
</style>
