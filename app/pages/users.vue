<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const users = ref<User[]>([])
const totalPages = ref(1)
const pending = ref(false)
const error = ref<Error | null>(null)

const route = useRoute()
const router = useRouter()

const query = computed(() => route.query.q ?? '')
const page = ref(Number(route.query.page) || 1)

const searchTerm = ref<string>(query.value as string)

const setPage = (newPage: number) => {
  page.value = newPage
  router.replace({
    query: { ...route.query, page: newPage }
  })
}

const fetchData = async (pageNum = 1) => {
  pending.value = true
  error.value = null

  try {
    await router.replace({
      query: {
        ...route.query,
        page: pageNum,
        q: searchTerm.value || undefined
      }
    })

    const response = await $fetch('/api/user', {
      query: {
        username: searchTerm.value,
        limit: 32,
        offset: pageNum - 1
      }
    })

    users.value = response.data as User[] || []
    totalPages.value = Math.ceil((response.count || 1) / (response.limit || 10))
  } catch (err) {
    error.value = err as Error
  } finally {
    pending.value = false
  }
}

const debounceFetch = useDebounceFn(() => fetchData(1), 750)

watch(() => route.query.q, (newVal) => {
  searchTerm.value = newVal as string ?? ''
})

watch(searchTerm, () => debounceFetch())

watch(page, (newPage) => fetchData(newPage))

onMounted(() => {
  fetchData(page.value)
})
</script>
<template>
  <Page wide title="Search Users" require-auth>
    <div>
      <div class="flex mb-6">
        <UInput icon="i-lucide-search" placeholder="Search..." :loading="pending" class="w-full" size="xl"
          v-model="searchTerm" />
      </div>
      <div class="grid grid-cols-1 gap-2 group-card-list md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <UserCard v-for="user in users" :user="user" />
      </div>
      <div class="flex justify-center flex-wrap gap-2 my-6">
        <UPagination :total="totalPages" @update:page="setPage" />
      </div>
    </div>
  </Page>
</template>