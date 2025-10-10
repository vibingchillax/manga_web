<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { User } from '~~/shared/types';

const props = withDefaults(defineProps<{
  added: string[]
  max?: number
}>(), {
  added: () => [],
  max: Infinity,
})

const emit = defineEmits(['add', 'remove'])

const results = ref(null)
const page = ref(1)
const search = ref('')
const pending = ref(false)
const error = ref<string | null>(null)
const totalPages = ref(0)
const resultList = ref<User[]>([])

const fetchUsers = async () => {
  pending.value = true
  error.value = null
  try {
    const res = await $fetch('/user', {
      query: {
        limit: 20,
        offset: (page.value - 1) * 20,
        username: search.value,
      }
    })
    resultList.value = res.data
    totalPages.value = res.count === 0 ? 1 : Math.ceil(res.count / 20)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    pending.value = false
  }
}

const reload = async () => {
  resultList.value = []
  page.value = 1
  await fetchUsers()
}

const debouncedReload = useDebounceFn(reload, 1000)
watch(search, debouncedReload)

watch(page, fetchUsers)

function toggleUser(user: User) {
  if (props.added.includes(user.id)) emit('remove', user.id)
  else if (props.added.length < props.max) emit('add', user)
}
</script>
<template>
  <div>
    <h3>Find User</h3>

    <div class="flex mb-6" ref="results">
      <UInput v-model="search" icon="i-lucide-search" placeholder="Search users" />
    </div>

    <div v-if="pending && resultList.length === 0" class="flex justify-center">
      Loading...
    </div>

    <div v-else-if="resultList.length > 0">
      <div class="grid grid-cols-1 gap-2" :class="{
        'user-card-list': true,
        // 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4':
        //   listStyleNoArt === ListStyle.Details
      }">
        <div v-for="user in resultList" :key="user.id" class="user-container" :class="{
          added: added.includes(user.id),
          disabled: !added.includes(user.id) && added.length >= max
        }" @click.stop="toggleUser(user)">
          <UserCard :user="user" no-link />

          <UButton color="primary" :disabled="!added.includes(user.id) && added.length >= max"
            :text="added.includes(user.id)" :variant="!added.includes(user.id) ? 'solid' : 'outline'"
            :icon="added.includes(user.id) ? 'i-lucide-minus' : 'i-lucide-plus'" />
        </div>
      </div>

      <ProseCaution v-if="error" class="my-6">
        Error: {{ error }}
      </ProseCaution>
    </div>

    <div v-else-if="error">
      <ProseCaution class="my-6">
        Error: {{ error }}
      </ProseCaution>

      <UButton class="my-6" block glow color="primary" @click="fetchUsers">
        Retry
      </UButton>
    </div>

    <div v-else-if="!pending" class="my-6">
      <ProseNote class="my-6">No results found</ProseNote>
    </div>

    <UPagination v-if="resultList.length > 0 || pending" class="my-6"
      v-model="page" :total="totalPages" />
  </div>
</template>
<style lang="css" scoped>
.user-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-container.added {
  opacity: 0.6;
}

.user-container.disabled {
  pointer-events: none;
  opacity: 0.4;
}
</style>