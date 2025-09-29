<script setup lang="ts">
import type { UploadPage } from './Pages.vue';
import JSZip from 'jszip'

const toast = useToast()

const props = defineProps<{
  disabled?: boolean;
  shouldReslice?: boolean;
}>();

const pages = defineModel<UploadPage[]>({required: true})

const emit = defineEmits<{
  (e: "removePages", pages: UploadPage[]): void;
  (e: "newFiles", files: UploadPage[]): void;
}>();

defineExpose({
  reset: resetPages,
});

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const ZIP_TYPES = ["application/zip", "application/x-zip-compressed", "multipart/x-zip"];
const ACCEPTED_TYPES = [...IMAGE_TYPES, ...ZIP_TYPES];
const ACCEPTED_EXTS = ["cbz"];
const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
};
const SKIP_FILES = [".DS_Store", "__MACOSX"];
const MAX_RETRIES = 3;

const editingFile = ref<UploadPage | null>(null);
const isProcessing = ref(false);
const showSkippedWarning = ref(false);
const busyCount = ref(0);

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sortByFileName(arr: UploadPage[]): UploadPage[] {
  return arr.sort((a,b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true }));
}

async function unzipAndFilter(file: File) {
  const zip = await new JSZip().loadAsync(file);
  let skipped = 0;
  const tasks: Promise<File>[] = [];

  zip.forEach((relativePath, entry) => {
    if (!entry || entry.dir || SKIP_FILES.some(f => relativePath.includes(f))) return;

    const name = relativePath.split("/").pop()!;
    const ext = name.split(".").pop()!.toLowerCase();
    if (!Object.keys(IMAGE_MIME).includes(ext)) {
      skipped++;
      return;
    }
    tasks.push(
      entry.async("blob").then(blob => new File([blob], name, { type: IMAGE_MIME[ext], lastModified: entry.date.getTime() }))
    );
  });

  return [tasks, skipped] as const;
};

async function addFiles(newFiles: File[], message?: string) {
  busyCount.value++;
  const processedFiles = await processFiles(newFiles, message);
  busyCount.value--;
  return processedFiles;
}

async function processFiles(files: File[], message?: string, pushToPages = true): Promise<UploadPage[]> {
  if (files.length === 0) return [];

  const pagesToAdd: UploadPage[] = [];

  for (const file of files) {
    let failReason = '';
    let preview = '';
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTS.includes(ext)) {
      toast.add({
        title: "Warning",
        color: "warning",
        description: 'Some files were skipped.',
        duration: 10000,
      })
      continue;
    }

    if (ZIP_TYPES.includes(file.type) || ACCEPTED_EXTS.includes(ext)) {
      const [extractedFiles, skipped] = await unzipAndFilter(file);
      if (skipped > 0) {
        toast.add({
          title: "Warning",
          color: "warning",
          description: 'Some files were skipped.',
          duration: 10000,
        })
      }
      const resolvedFiles = await Promise.all(extractedFiles);
      const nestedPages = await processFiles(resolvedFiles, 'Automatically extracted from archive', false);
      pagesToAdd.push(...nestedPages);
      continue;
    }

    if (file.size < 50 * 1024 * 1024) {
      try {
        preview = URL.createObjectURL(file);
        const img = await loadImage(preview);
        if (img.width > 10000) failReason = 'File over 10k pixels wide';
        if (img.height > 10000) {
          if (props.shouldReslice) {
            const slices = await reslicePages([{ image: img, filename: file.name }]);
            const slicedPages = await processFiles(slices, 'Automatically sliced', false);
            pagesToAdd.push(...slicedPages);
            continue;
          } else {
            failReason = 'File over 10k pixels tall';
          }
        }
      } catch {
        toast.add({
          title: 'Warning',
          color: 'warning',
          description: 'Some files were skipped.',
          duration: 10000
        })
        continue;
      }
    } else {
      failReason = 'File size over 50MB';
    }

    const page: UploadPage = {
      retriesLeft: 3,
      id: generateUUID(),
      file,
      preview,
      progress: -1,
      isDuplicate: false,
      dragging: false,
      failReason,
      message,
      state: failReason ? UploadState.Fail : UploadState.Pending,
      promise: Promise.resolve(),
      resolve: () => {}
    };

    if (!failReason) {
      page.promise = new Promise<void>((resolve) => {
        page.resolve = resolve;
      });
    }

    pagesToAdd.push(page);
  }

  if (pushToPages) {
    pages.value.push(...pagesToAdd);
    emit('newFiles', pagesToAdd.filter(p => p.state === UploadState.Pending));
  }

  return pagesToAdd;
}

function removePages(files: UploadPage[], emitEvent = true) {
  const idsToRemove = files.map(f => f.id);
  pages.value = pages.value.filter(f => !idsToRemove.includes(f.id));
  files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
  if (emitEvent) emit("removePages", files);
};

function removePage(file: UploadPage, emitEvent = true) {
  removePages([file], emitEvent);
}
function removeAll(emitEvent = false) {
  removePages(pages.value.filter(f => f.state !== UploadState.PendingRemoval && f.state !== UploadState.Removed), emitEvent);
}
function removeFailed() {
  removePages(pages.value.filter(f => f.state === UploadState.Fail));
}

async function updateFile(file: File) {
  if (!editingFile.value) return;

  const index = pages.value.findIndex(p => p.id === editingFile.value!.id);
  if (index === -1) return;

  const updatedPages = await processFiles([file], "Replaced file", false);
  pages.value.splice(index, 1, ...updatedPages);
  removePage(editingFile.value, false);
  editingFile.value = null;
  emit("newFiles", updatedPages.filter(p => p.state === UploadState.Pending));
};

function quickSort() {
  pages.value = sortByFileName([...pages.value]);
};

async function resetPages() {
  busyCount.value++;
  const validPages = pages.value.filter(p => ![UploadState.PendingRemoval, UploadState.Removed].includes(p.state!));
  await processFiles(validPages.map(p => p.file));
  busyCount.value--;
}

function findDifferingNumber(from: string, to: string) {
  const normalize = (str: string) => str.replace(/\s+/g, "");
  from = normalize(from);
  to = normalize(to);

  const numberRegex = /\d+(\.\d+)?[a-z]?/g;
  const fromMatches: { match: string; offset: number }[] = [];
  
  let match: RegExpExecArray | null;
  let offset = 0;

  while ((match = numberRegex.exec(from))) {
    fromMatches.push({ match: match[0], offset: (match.index || 0) - offset });
    offset += match[0].length;
  }

  offset = 0;
  let differingMatch: RegExpExecArray | null = null;
  while ((match = numberRegex.exec(to))) {
    const adjustedIndex = (match.index || 0) - offset;

    if (fromMatches.some(fm => fm.offset === adjustedIndex && fm.match !== match![0])) {
      if (differingMatch) return null;
      differingMatch = match;
    }

    offset += match[0].length;
  }

  if (!differingMatch) return null;

  return {
    before: to.substring(0, differingMatch.index || 0),
    after: to.substring((differingMatch.index || 0) + differingMatch[0].length),
    pad: differingMatch[0][0] === "0" ? differingMatch[0].length : 0
  };
};

function createFilenameFormatter(filenames: string[]): ((num: number) => string) {
  if (filenames.length < 2) return (n: number) => n.toString().padStart(3, "0");

  let basePattern = null;

  for (let i = 0; i < filenames.length - 1; i++) {
    const diff = findDifferingNumber(filenames[i]!, filenames[i + 1]!);
    if (diff) {
      if (!basePattern) basePattern = diff;
      else {
        if (basePattern.before !== diff.before || basePattern.after !== diff.after) {
          // Inconsistent pattern -> fallback to default
          return (n: number) => n.toString().padStart(3, "0");
        }
        basePattern.pad = Math.max(basePattern.pad, diff.pad);
      }
    }
  }

  if (!basePattern) return (n: number) => n.toString().padStart(3, "0");

  const { before, after, pad } = basePattern;
  return (n: number) => `${before}${n.toString().padStart(pad, "0")}${after}`;
};

function canvasToBlob(canvas: HTMLCanvasElement, mimeType = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(blob)), mimeType);
  });
}

function computeSliceHeights(inputHeight: number, targetHeight: number): number[] {
  if (inputHeight <= targetHeight) return [inputHeight];

  const slices = Math.floor(inputHeight / targetHeight);
  const baseHeight = Math.floor(inputHeight / slices);
  const remainder = inputHeight % baseHeight;

  const heights = Array(slices).fill(baseHeight);
  for (let i = 0; i < remainder; i++) heights[i] += 1;

  return heights;
};

async function resliceImage(
  page: { image: HTMLImageElement; filename: string },
  sliceHeights: number[]
): Promise<File[]> {
  console.log(`(${page.filename}) - Reslicing image with slice heights: ${sliceHeights}`);

  const slices: File[] = [];
  let currentY = 0;

  const pushSlice = async (canvas: HTMLCanvasElement) => {
    const blob = await canvasToBlob(canvas);
    slices.push(new File([blob], `${page.filename}-${slices.length + 1}.png`, { type: "image/png" }));
  };

  for (let i = 0; i < sliceHeights.length; i++) {
    const height = sliceHeights[i]!;
    console.log(`(${page.filename}) - Drawing slice ${i + 1} with y0=${currentY} height=${height}`);

    const canvas = document.createElement("canvas");
    canvas.width = page.image.width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(page.image, 0, -currentY);

    await pushSlice(canvas);
    currentY += height;
  }

  console.log(`(${page.filename}) - Committed ${slices.length} slices`);
  console.log(`(${page.filename}) - Unloading original image from memory.`);
  URL.revokeObjectURL(page.image.src);

  return slices;
};

async function reslicePages(
  pages: { image: HTMLImageElement; filename: string }[]
): Promise<File[]> {
  console.log(`Reslicing ${pages.length} pages: ${pages.map(p => p.filename)}`);

  const allSlices: File[] = [];

  for (const page of pages) {
    const sliceHeights = computeSliceHeights(page.image.height, 2000);
    const slices = await resliceImage(page, sliceHeights);
    allSlices.push(...slices);
  }

  return allSlices;
};

const isPendingPage = (f: UploadPage): f is UploadPage & { state: UploadState; preview: string } =>
  typeof f.state === "number" &&
  [UploadState.Pending, UploadState.Uploading, UploadState.Success].includes(f.state) &&
  typeof f.preview === "string" && f.preview.length > 0;

async function resliceLargeImages() {
  isProcessing.value = true;
  const pendingPages = pages.value.filter(isPendingPage);
  const images = await Promise.all(pendingPages.map(f => loadImage(f.preview)));
  const filenames = createFilenameFormatter(pendingPages.map(f => f.file.name));
  const sliced = await reslicePages(images.map((img, i) => ({ image: img, filename: filenames(i + 1) })));
  removePages(pendingPages);
  await addFiles(sliced);
  isProcessing.value = false;
};
</script>
<template>
  <div>
    <MangaUploadPages
      v-model="pages"
      :disabled="disabled"
      @add-files="addFiles"
      @remove-file="removePage"
      @edit-click="file => editingFile = file"
      @edit-file="updateFile"
      :accept="[...IMAGE_TYPES, ...ACCEPTED_EXTS.map(e => '.' + e)]"
    />

    <div v-if="!disabled && pages.length > 0" class="flex my-2 flex-wrap">
      <UPopover v-if="shouldReslice" text="reslice tooltip">
        <UButton @click="resliceLargeImages" size="xl" :loading="isProcessing" :disabled="isProcessing">
          Reslice all pages
        </UButton>
      </UPopover>

      <UButton @click="quickSort" variant="ghost" color="neutral" size="xl" :disabled="isProcessing">
        Quick sort
      </UButton>

      <UButton @click="() => removeAll(false)" variant="ghost" color="neutral" size="xl" :disabled="isProcessing">
        Remove all
      </UButton>

      <UButton v-if="pages.some(p => p.state === UploadState.Fail)" @click="removeFailed" variant="ghost" color="neutral" size="xl" :disabled="isProcessing">
        Remove all failed pages
      </UButton>
    </div>
  </div>
</template>