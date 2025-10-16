<script setup lang="ts">
import Draggable from "vuedraggable"

export interface UploadPage {
  id: string
  file: File
  preview: string
  state: number   //0=queued, 1=uploading, 2=done, 3=failed
  progress: number
  retriesLeft: number
  message?: string
  failReason?: string
  isDuplicate: boolean
  dragging: boolean
  promise: Promise<void>
  resolve: () => void
  cancel?: {
    controller: AbortController
    count: number
  },
  sessionFile?: {
    id: string;
    version: number;
    originalFileName: string;
    cid: string;
    fileSize: number;
    mimeType: string;
    source: string;
  }
}

defineProps<{
  disabled?: boolean
  accept: string[]
}>()

const pages = defineModel<UploadPage[]>({ required: true })

const emit = defineEmits<{
  (e: "addFiles", files: File[]): void
  (e: "editClick", page: UploadPage): void
  (e: "editFile", file: File): void
  (e: "removeFile", page: UploadPage): void
}>()

const dragTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
// const currentDraggedId = ref<string | number | null>(null)
const addFileInput = useTemplateRef('addFileInput')
const editFileInput = useTemplateRef('editFileInput')

const state = reactive({
  showPages: false,
})

function handleAddFiles() {
  if (!addFileInput.value) return
  const files = addFileInput.value.files
  if (files) {
    emit("addFiles", Array.from(files))
    addFileInput.value.value = ""
  }
}

function handleEditFile() {
  if (!editFileInput.value) return
  const files = editFileInput.value.files
  if (files && files[0]) {
    emit("editFile", files[0])
    editFileInput.value.value = ""
  }
}

function handleDragOver(e: DragEvent) {
  if (
    e.dataTransfer &&
    e.dataTransfer.items.length &&
    // e.dataTransfer.items[0].kind === "file"
    e.dataTransfer.items[0]!.kind === "file"
  ) {
    if (dragTimeout.value) clearTimeout(dragTimeout.value)
    dragTimeout.value = setTimeout(() => (dragTimeout.value = null), 500)
    e.preventDefault()
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  dragTimeout.value = null
  if (!e.dataTransfer) return

  // If webkitGetAsEntry not available, fallback
  if (!DataTransferItem.prototype.webkitGetAsEntry) {
    const files = Array.from(e.dataTransfer.items)
      .map(it => it.getAsFile())
      .filter((f): f is File => !!f)
    emit("addFiles", files)
    return
  }

  const blocked = [".DS_Store", "__MACOSX"]
  const traverse = async (entry: any): Promise<File[]> => {
    if (entry.isFile) {
      return new Promise(resolve => entry.file((file: File) => resolve([file])))
    }
    if (entry.isDirectory && !blocked.includes(entry.name)) {
      const reader = entry.createReader()
      const entries: any[] = []
      let batch
      do {
        batch = await new Promise<any[]>(res => reader.readEntries(res))
        entries.push(...batch)
      } while (batch.length)
      const results = await Promise.all(entries.map(traverse))
      return results.flat()
    }
    return []
  }

  Promise.all(
    Array.from(e.dataTransfer.items)
      .map(it => it.webkitGetAsEntry())
      .filter(Boolean)
      .map(traverse)
  ).then(results => emit("addFiles", results.flat()))
}

onMounted(() => {
  document.addEventListener("dragover", handleDragOver)
  document.addEventListener("drop", handleDrop)
})
onBeforeUnmount(() => {
  document.removeEventListener("dragover", handleDragOver)
  document.removeEventListener("drop", handleDrop)
})
</script>

<template>
  <h4 class="font-medium">Pages</h4>
  <div class="flex justify-left flex-wrap gap-2">
    <UCheckbox v-model="state.showPages" class="w-full mb-2" v-show="pages.length >= 75" />

    <Draggable v-model="pages" item-key="id" class="flex justify-left flex-wrap" :disabled="disabled"
      :animation="100"
      >
      <template #item="{ element }: { element: UploadPage }">
        <div class="flex-grow-0 p-3" :class="{ 'draggable-page': !disabled }">
          <MangaUploadImage
            :disabled="disabled"
            :dragging="element.dragging"
            :isDuplicate="element.isDuplicate"
            :preview="element.preview"
            :state="element.state"
            :failReason="element.failReason"
            :message="element.message"
            :fileName="element.file?.name"
            :progress="element.progress"
            :id="element.id"
            :compact="!state.showPages && pages.length >= 75"
            @remove="$emit('removeFile', element)"
            @editClick="$emit('editClick', element), editFileInput?.click()" /> 
            <!-- i dont know what was the purpose of emitting it up? -->
        </div>
      </template>

      <template #footer>
        <div v-if="!disabled" class="flex-grow-0 p-3">
          <MangaUploadImage input="add-file"
            :compact="!state.showPages && pages.length >= 75" />
        </div>
      </template>
    </Draggable>

    <input id="add-file" ref="addFileInput" type="file" multiple
      :accept="accept.join(',')" :disabled="disabled"
      @change="handleAddFiles" style="display:none" />
    <input id="edit-file" ref="editFileInput" type="file"
      :accept="accept.join(',')" :disabled="disabled"
      @change="handleEditFile" style="display:none" />

    <Overlay v-if="dragTimeout" attach="body">
      <UTooltip>
        Drop files anywhere to upload!
      </UTooltip>
    </Overlay>
  </div>
</template>