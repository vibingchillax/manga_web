<script setup lang="ts">
const props = defineProps<{ manga: Manga }>()

const modalOpen = ref(false)
const route = useRoute()
const router = useRouter()
const auth = useAuth()
const redirect = useAuthRedirect()

const toast = useToast()

const selected = ref('none')

const { data: followStatus, error, pending } = await useFetch(`/manga/${props.manga.id}/follow`)

const items = ref([
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Reading',
    value: 'reading'
  },
  {
    label: 'On Hold',
    value: 'onHold'
  },
  {
    label: 'Dropped',
    value: 'dropped'
  },
  {
    label: 'Plan to Read',
    value: 'planToRead'
  },
  {
    label: 'Completed',
    value: 'completed'
  },
  {
    label: 'Re-Reading',
    value: 'rereading'
  }
])

const followLabel = computed(() => {
  const status = selected.value ?? 'none'
  const item = items.value.find(i => i.value === status)
  return item?.label === 'None' ? 'Add to Library' : item?.label
})

function openModal() {
  if (!auth.session.value?.isAuthenticated) {
    redirect.value = route.path
    router.push("/login")
    return
  }
  modalOpen.value = true
}

function successToast() {
  toast.add({
    description: 'Manga updated successfully'
  })
  modalOpen.value = false
}

async function update() {
  if (selected.value === 'none') {
    const del = await $fetch(`/manga/${props.manga.id}/follow`, {
      method: "DELETE",
    })
    if (del.status === 'ok') {
      successToast()
    } else {
      toast.add({
        description: 'Request failed'
      })
    }
    return
  }

  const add = await $fetch(`/manga/${props.manga.id}/follow`, {
    method: "POST", body: {
      status: selected.value as string
    }
  })

  if (add.status === 'ok') {
    successToast()
  } else {
    toast.add({
      description: 'Request failed'
    })
  }
}

watchEffect(() => {
  if (followStatus.value?.status) {
    selected.value = followStatus.value.status
  }
})
</script>
<template>
  <UButton :label="followLabel" @click="openModal" :loading="pending" :icon="selected === 'none' ? '' : 'i-lucide-check'" />
  <UModal v-model:open="modalOpen" title="Add to Library" :ui="{ content: 'preview-modal' }">
    <template #body>
      <div class="text-sm pb-5 first:pt-4 px-4">
        <div class="preview-grid">
          <NuxtImg class="rounded shadow-lg width-limit self-start" style="grid-area: cover;"
            :src="useMangaCover(manga).coverUrl256" :alt="useMangaTitle(manga)" />
          <div style="grid-area: options;">
            <div class="font-bold text-xl self-start mb-2" style="grid-area: title; word-break: break-word;">
              {{ useMangaTitle(manga) }}
            </div>
            <div class="self-start" style="grid-area: options;">
              <USelect v-model="selected" :items="items" :ui="{ content: 'min-w-fit' }" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 items-end p-4 pt-0 justify-end">
        <div class="flex sm:flex-row flex-col gap-4 sm:flex-grow-0 flex-grow">
          <UButton color="neutral" @click="modalOpen = false">Cancel</UButton>
          <UButton color="primary" @click="update">Update</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
<style lang="css" scoped>
.preview-modal {
  max-width: 800px;
  max-height: calc(100% - 3rem);
}

.preview-grid {
  display: grid;
  gap: .5rem;
  grid-template-areas:
    "cover   title  "
    "options options";
  grid-template-columns: minmax(0, 72px) auto;
}

@media (min-width: 40rem) {
  .preview-grid {
    gap: 1rem;
    grid-template-areas:
      "cover options"
      "cover options";
    grid-template-columns: minmax(0, 250px) auto;
    grid-template-rows: min-content auto;
  }
}
</style>