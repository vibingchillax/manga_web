<script setup lang="ts">
import type { UploadPage } from '~/components/manga/upload/Pages.vue'
import SuccessModal from '~/components/manga/upload/SuccessModal.vue'
import { UploadState } from '~~/shared/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const overlay = useOverlay()

const { data: mangaResponse, pending, error } = await useMangadex('/manga/{id}', {
  path: {
    id: route.params.mangaId as string
  },
  query: {
    "includes[]": ['cover_art', 'author', 'artist']
  },
  key: `manga-${route.params.mangaId}`
})

const session = ref<string | null>(null)
const manga = mangaResponse.value?.data
const pages = ref<UploadPage[]>([])
const selectedGroups = ref<string[]>([])

const oneshot = ref(false)
const volNumber = ref("")
const chNumber = ref("")
const tlLang = ref("")
const chName = ref("")

const formLocked = ref(false)
const uploadIssues = ref([]);
const showUploadConfirm = ref(false);
const canDismissConfirm = ref(true);
const uploadFailed = ref(false);
const uploadFailedReason = ref("");
const uploadTakingAWhile = ref(false);
const pendingRemoval = ref(0);
const removePromises = ref<Promise<void>[]>([])
const uploadJobPromises = ref<Promise<void>[]>([])
const showIdkGroupWarning = ref(false);

const submitting = ref(false)

const canSubmit = computed(() => {
  const hasPages = pages.value.length > 0 && pages.value.some(p => p.state === UploadState.Success)
  return Boolean(session.value && tlLang.value.length >= 2 && hasPages && !submitting.value)
})

const successModal = overlay.create(SuccessModal)

const BATCH_SIZE = 3;   // Bo
const CONCURRENCY = 3;  // qp

async function runWithConcurrency<T, R>(
  concurrency: number,
  items: T[],
  worker: (item: T) => Promise<R>): Promise<R[]> {
  const queue = [...items];
  const allPromises: Promise<R>[] = [];
  const active: Promise<void>[] = [];

  const runNext = (): Promise<void> => {
    if (queue.length === 0) {
      return Promise.resolve();
    }

    const item = queue.pop() as T;

    const promise = Promise.resolve().then(() => worker(item));
    allPromises.push(promise);

    let wait = Promise.resolve();
    if (concurrency <= items.length) {
      const cleanup = promise.then(() => {
        active.splice(active.indexOf(cleanup), 1);
      });

      active.push(cleanup);
      if (active.length >= concurrency) {
        wait = Promise.race(active);
      }
    }
    return wait.then(() => runNext());
  };

  await runNext();
  return Promise.all(allPromises);
}

function setFileState(fileId: string, state: UploadState, failReason?: string) {
  pages.value = pages.value.map(f => f.id === fileId ? { ...f, state, failReason } : f)
}

function setFileProgress(fileId: string, progress: number) {
  pages.value = pages.value.map(f => f.id === fileId ? { ...f, progress } : f)
}

async function processUploads(files: UploadPage[]): Promise<void> {
  if (!session.value) return

  const batches: any[][] = [];
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files
      .slice(i, i + BATCH_SIZE)
      .filter((f) => f.state !== UploadState.Removed);
    if (batch.length !== 0) {
      batches.unshift(batch); // reverse order
    }
  }

  const processBatch = async (batch: UploadPage[]): Promise<void> => {
    batch.forEach((file) => {
      if (file.state === UploadState.PendingRemoval) {
        file.resolve();
      } else {
        nextTick().then(() => {
          setFileState(file.id, UploadState.Uploading);
        });
      }
    });

    batch = batch.filter((f) => f.state !== UploadState.PendingRemoval);

    const cancelBundle = {
      controller: new AbortController(),
      count: batch.length,
    };

    for (const file of batch) {
      file.cancel = cancelBundle;
    }

    const results = await uploadFiles(
      batch.map((f) => f.file),
      (progressEvent) => {
        if (progressEvent.loaded === progressEvent.total) return;
        const ratio = progressEvent.loaded / progressEvent.total;
        batch.forEach((file, index) => {
          setFileProgress(file.id, Math.min(1, ratio * batch.length - index));
        });
      },
      cancelBundle.controller.signal
    );

    const retryQueue: UploadPage[] = [];

    pages.value = pages.value.map((file) => {
      const index = batch.map((f) => f.id).indexOf(file.id);
      if (index === -1) return file;

      const result = results[index]!;
      const shouldRetry =
        !result.success &&
        result.shouldRetry &&
        file.state !== UploadState.PendingRemoval &&
        file.retriesLeft > 0;

      if (result.success) {
        return {
          ...file,
          state:
            file.state === UploadState.PendingRemoval ? UploadState.PendingRemoval : UploadState.Success,
          progress: 1,
          sessionFile: result.sessionFile,
        };
      } else {
        if (shouldRetry) retryQueue.push(file);
        return {
          ...file,
          retriesLeft: file.retriesLeft - 1,
          progress: 0,
          state:
            file.state === UploadState.PendingRemoval
              ? UploadState.PendingRemoval
              : shouldRetry
              ? UploadState.Pending
              : UploadState.Fail,
          failReason: shouldRetry ? undefined : result.error,
        };
      }
    });

    if (retryQueue.length > 0) {
      retryQueue.forEach((f) => processUploads([f]));
    }

    batch.forEach((file) => {
      file.resolve();
      if (file.state === UploadState.PendingRemoval) {
        const matching = files.find((f) => f.id === file.id);
        removeFiles([{ ...file, sessionFile: matching?.sessionFile }]);
      }
    });
  };

  const resolvers: ((value: void) => void)[] = [];
  const existingJobs = [...uploadJobPromises.value];
  const newJob = new Promise<void>((resolve) => resolvers.push(resolve));

  uploadJobPromises.value.push(newJob);

  await Promise.all(existingJobs);
  await runWithConcurrency(CONCURRENCY, batches, processBatch);

  if (resolvers[0]) {
    resolvers[0]();
  }
};

async function removeFiles(pages: UploadPage[]): Promise<void> {
  if (!session.value) return
  pendingRemoval.value += pages.length;

  for (const file of pages) {
    if (file.cancel) {
      file.cancel.count--;
      if (file.cancel.count === 0) {
        file.cancel.controller.abort();
      }
    }
  }

  await Promise.all(
    pages.map((file) =>
      file.sessionFile ? Promise.resolve() : file.promise
    )
  );

  const toRemove: string[] = pages
    .map((file) => file.sessionFile!.id)
    .filter(Boolean);

  if (toRemove.length === 0) {
    pendingRemoval.value -= pages.length;
    return;
  }

  removePromises.value.push(
    (async () => {
      await deletePages(session.value!, toRemove);
      pendingRemoval.value -= pages.length;
    })()
  );
};

async function existingSession() {
  return await $fetch('/upload', {
    method: "GET"
  })
}

async function beginSession(manga: string, groups: string[]) {
  return await $fetch('/upload/begin', {
    method: "POST",
    body: {
      manga: manga,
      groups: groups
    }
  })
}

async function uploadFiles(files: File[], onProgress: (progressEvent: any) => void, signal: AbortSignal) {
  if (!session.value) throw new Error("No upload session")

  const sessionId = session.value

  if (files.length === 0) {
    throw new Error("No files to upload")
  }

  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(`file${index + 1}`, file);
  });

  let shouldRetry = false;
  let response: {
    errors: {
      filename: string
      message: string
    }[]
    data: {
      id: string;
      version: number;
      originalFileName: string;
      cid: string;
      fileSize: number;
      mimeType: string;
      source: string;
    }[]
    // @ts-ignore
  } = await $fetch(`/upload/${sessionId}`, {
    signal,
    body: formData,
    method: "POST"
  })

  if (response.errors.length > 0) {
    shouldRetry = true
    const defaultError = response.errors[0]?.message || "Unknown error";
    response = {
      ...response,
      errors: files.map((file, index) => ({
        filename: file.name,
        message: defaultError
      }))
    };
  }

  return files.map((file, index) => {
    let sessionFile;

    if (response.data.length === files.length) {
      sessionFile = response.data[index];
    } else {
      sessionFile = response.data.find(
        ({ originalFileName, fileSize }) =>
          file.name === originalFileName && file.size === fileSize
      );
    }

    if (!sessionFile) {
      let errorDetail: string;
      if (response.errors.length === files.length) {
        errorDetail = response.errors[index]!.message;
      } else {
        errorDetail = response.errors.find(err => err.message)!.message;
      }

      return {
        success: false,
        error: errorDetail ?? "Unknown error",
        shouldRetry
      };
    }

    return {
      success: true,
      sessionFile
    };
  });
}

async function deletePages(sessionId: string, ids: string[]) {
  return await $fetch(`/upload/${sessionId}/batch`, {
    method: "DELETE",
    body: JSON.stringify(ids)
  })
}

async function deleteSession(sessionId: string) {
  return await $fetch(`/upload/${sessionId}`, {
    method: "DELETE"
  })
}

async function uploadChapter(addAnother = false) {
  if (!session.value) return
  submitting.value = true
  formLocked.value = true
  try {
    await $fetch(`/upload/${session.value}/commit`, {
      method: "POST",
      body: {
        chapterDraft: oneshot.value ? {
          volume: null,
          chapter: null,
          title: chName.value,
          translatedLanguage: tlLang.value,
          publishAt: new Date()
        } : {
          volume: volNumber.value,
          chapter: chNumber.value,
          title: chName.value,
          translatedLanguage: tlLang.value,
          publishAt: new Date()
        },
        pageOrder: pages.value.map(p => p.sessionFile?.id)
      }
    })
    formLocked.value = false
    if (addAnother) {
      toast.add({
        title: 'Success',
        description: 'Chapter uploaded successfully. You can add another chapter now.',
        color: 'success'
      })
      resetForm()
    } else {
      successModal.open({ manga: manga! })
    }
    resetUnsavedChangesWarning()
  } catch (error) {
    uploadFailed.value = true
    uploadFailedReason.value = (error as Error).message
    toast.add({
      title: 'Error',
      description: `Failed to commit upload: ${error}`,
      color: 'error'
    })
  } finally {
    formLocked.value = false
    submitting.value = false
  }
}

function confirmUnsavedChanges() {
  window.onbeforeunload = () => 'You have unsaved changes! Are you sure you want to leave?'
}

function resetUnsavedChangesWarning() {
  window.onbeforeunload = null
}

async function resetForm() {
  oneshot.value = false
  volNumber.value = ""
  chNumber.value = ""
  tlLang.value = ""
  chName.value = ""
  pages.value = []
  try {
    const existing = await existingSession()
    if (existing) {
      await deleteSession(existing.id)
    }
  } catch {
  }

  try {
    const newSession = await beginSession(manga?.id!, selectedGroups.value)
    session.value = newSession.id
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to start upload session',
      color: 'error'
    })
  }
}

onMounted(async () => {
  if (useAuth().loggedIn.value) {
    try {
      const existing = await existingSession()
      if (existing) {
        await deleteSession(existing.id)
      }
    } catch {
    }

    try {
      const newSession = await beginSession(manga?.id!, selectedGroups.value)
      session.value = newSession.id
    } catch {
      toast.add({
        title: 'Error',
        description: 'Failed to start upload session',
        color: 'error'
      })
    }
  }
})

onUnmounted(() => {
  if (session.value) {
    deleteSession(session.value)
  }
})

watch(pages, () => {
  confirmUnsavedChanges()
})
</script>
<template>
  <Page title="Upload Chapter" :wide="false" require-auth>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else-if="error">
      {{ error }}
    </div>
    <template v-else-if="manga">
      <MangaUploadDetails
        :manga="manga"
        :form-locked="formLocked"
        v-model:oneshot="oneshot"
        v-model:vol-number="volNumber"
        v-model:ch-number="chNumber"
        v-model:tl-lang="tlLang"
        v-model:ch-name="chName"
        />
      <USeparator class="my-4 col-span-6" />
      <MangaUploadPagesWrapper
        v-if="session"
        v-model="pages"
        @new-files="pages => processUploads(pages)"
        @remove-pages="pages => removeFiles(pages)" />

      <USeparator class="my-4 col-span-6" />
      <div class="mt-4">
        <UButton size="xl" color="primary" :loading="submitting"
          :disabled="!canSubmit"
          @click="uploadChapter()">
          Upload
        </UButton>
        <UButton size="xl" color="primary" variant="ghost"
          :loading="submitting"
          :disabled="!canSubmit"
          @click="uploadChapter(true)">
          Upload and add another chapter
        </UButton>
      </div>
    </template>
  </Page>
</template>