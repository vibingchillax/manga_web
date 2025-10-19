<script setup lang="ts">
import type { ScanlationGroup, User } from '~~/shared/types';
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui';
import equal from 'fast-deep-equal'

const props = defineProps<{
  create: boolean
  group?: ScanlationGroup
  loading: boolean
}>()

const allowEmpty = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().or(z.literal('')).transform(v => (v ? v : undefined))

const schema = z.object({
  name: z.string()
    .min(1, { message: 'Group name is required' })
    .max(100, { message: 'Group name must be less than 100 characters' }),
  leader: z.string().uuid().optional(),
  members: z.array(z.string().uuid()).optional(),
  website: allowEmpty(z.string().url({ message: 'Website must be a valid URL' })),
  ircServer: allowEmpty(z.string().max(100)),
  ircChannel: allowEmpty(z.string().max(100)),
  discord: allowEmpty(
    z.string()
      .regex(/^((https?:\/\/)?(www\.)?(discord\.(gg|com)\/(invite\/)?[A-Za-z0-9-]+))$/, {
        message: 'Must be a valid Discord invite link',
      })
      .max(200)
  ),
  contactEmail: allowEmpty(z.string().email({ message: 'Must be a valid email address' })),
  description: allowEmpty(z.string().max(500, { message: 'Description must be less than 500 characters' })),
  twitter: allowEmpty(
    z.string()
      .regex(
        /^(?:@)?(?:https?:\/\/(?:www\.)?twitter\.com\/)?([A-Za-z0-9_]{1,15})$/,
        { message: 'Must be a valid Twitter username, @username, or full Twitter URL' }
      )
      .transform(v => {
        const match = v.match(/([A-Za-z0-9_]{1,15})$/)
        return match ? match[1] : undefined
      })
  ),
  mangaUpdates: allowEmpty(
    z.string()
      .url({ message: 'Must be a valid URL' })
      .regex(/^https?:\/\/(www\.)?mangaupdates\.com\//, {
        message: 'Must be a valid MangaUpdates URL',
      })
      .max(200)
  ),
  focusedLanguages: z.array(z.string()).optional(),
  locked: z.boolean().optional(),
  publishDelay: z.string().default('P0D'),
})

export type GroupSchema = z.output<typeof schema>

type Member = User & {
  leader: boolean
}

const state = reactive<GroupSchema>({
  name: '',
  leader: undefined,
  members: [],
  website: undefined,
  ircServer: undefined,
  ircChannel: undefined,
  discord: undefined,
  contactEmail: undefined,
  description: undefined,
  twitter: undefined,
  mangaUpdates: undefined,
  focusedLanguages: [],
  locked: false,
  publishDelay: 'P0D'
})

const emit = defineEmits(['submit'])

const { loggedIn, isStaff } = useAuth()
const router = useRouter()

const languages = LANGUAGE_OPTIONS.ENGLISH_FIRST.WITHOUT_SCRIPTS

const members = ref<Member[]>([])
const original = ref<GroupSchema>()
const leaderChanged = ref(false)
const pendingData = ref<Partial<GroupSchema> | null>(null)
const showAddMember = ref(false)

const toState = (group: ScanlationGroup) => ({
  name: group.name ?? '',
  leader: group.members?.find(m => m.groupRole === 'leader')?.id,
  members: group.members?.map(m => m.id) ?? [],
  website: group.website ?? undefined,
  ircServer: group.ircServer ?? undefined,
  ircChannel: group.ircChannel ?? undefined,
  discord: group.discord ?? undefined,
  contactEmail: group.contactEmail ?? undefined,
  description: group.description ?? undefined,
  twitter: group.twitter ?? undefined,
  mangaUpdates: group.mangaUpdates ?? undefined,
  focusedLanguages: group.focusedLanguages ?? [],
  locked: group.locked ?? false,
  publishDelay: group.publishDelay ?? 'P0D',
})

const hasChanged = computed(() => {
  if (props.create || !props.group) return true
  return !equal(original, state)
})

function toggleLeader(member: Member) {
  if (!members.value.some(m => m.leader) ||
    members.value.some(m => m.leader && m.id !== member.id)) {
    members.value.forEach(m => m.leader = false)
    member.leader = true
  } else {
    member.leader = false
  }
}

function removeMember(id: string) {
  const index = members.value.findIndex(m => m.id === id)
  if (index !== -1) members.value.splice(index, 1)
}

function addMember(member: Member) {
  members.value.push({ ...member, leader: false })
}

async function onSubmit(event: FormSubmitEvent<GroupSchema>) {
  if (props.loading) return

  const data = {
    ...event.data,
    members: members.value.map(m => m.id),
    leader: members.value.find(m => m.leader)?.id,
  }

  const currentLeader = data.leader
  const originalLeader = original.value?.leader

  if (loggedIn.value && originalLeader !== currentLeader) {
    pendingData.value = data
    leaderChanged.value = true
  } else {
    submit(data)
  }
}

async function submit(data: Partial<GroupSchema>) {
  emit('submit', data)
  pendingData.value = null
  leaderChanged.value = false
}

watch(() => props.group, (group) => {
  if (!group) return

  state.name = group.name
  state.leader = group.members?.find(m => m.groupRole === 'leader')?.id
  state.members = group.members?.map(m => m.id)
  state.website = group.website ?? undefined
  state.ircServer = group.ircServer ?? undefined
  state.ircChannel = group.ircChannel ?? undefined
  state.discord = group.discord ?? undefined
  state.contactEmail = group.contactEmail ?? undefined
  state.description = group.description ?? undefined
  state.twitter = group.twitter ?? undefined
  state.mangaUpdates = group.mangaUpdates ?? undefined
  state.focusedLanguages = group.focusedLanguages
  state.locked = group.locked
  state.publishDelay = group.publishDelay ?? 'P0D'

  members.value = group.members?.map(m => ({
    ...m,
    leader: m.groupRole === 'leader'
  })) ?? []

  original.value = toState(group)
}, { immediate: true })
</script>
<template>
  <div class="sm:mb-6">
    <div class="flex">
      <UForm id="group-form" :schema="schema" :state="state" :loading="loading" @submit="onSubmit"
        class="mb-4 flex-auto">

        <div class="mb-2">
          <template v-if="create">
          </template>

          <template v-else-if="props.group">
            <div class="font-medium text-right">
              Last updated at
              <NuxtTime :datetime="props.group?.updatedAt" />
            </div>
          </template>

          <div>
            <div class="mb-6">
              <div class="font-medium mb-2">
                Group Name <span class="text-red-500">*</span>
              </div>
              <UFormField name="name" required>
                <UInput size="xl" class="w-full" v-model="state.name" required :disabled="!isStaff && !create" />
              </UFormField>
              <ProseNote v-if="!isStaff && !create">
                *Note: use the report function to request a group name change
              </ProseNote>
            </div>

            <div class="flex gap-4 items-center mb-6" v-if="!create">
              <div class="font-medium mb-2">Group Lock</div>
              <label class="flex items-center gap-2 cursor-pointer ml-auto" :aria-checked="state.locked">
                <UCheckbox :icon="state.locked ? 'i-lucide-lock' : 'i-lucide-unlock'" v-model="state.locked"
                  :label="state.locked ? 'Locked' : 'Unlocked'" />
              </label>
            </div>

            <div class="flex gap-4 items-center my-6">
              <div class="font-medium mb-2">Group Delay</div>
              <GroupFormPublishDelay v-model:duration="state.publishDelay" class="ml-auto"
                :disabled="!isStaff && !create" />
            </div>
          </div>
          <div class="mb-6" v-if="!create">
            <div class="font-medium mb-2">Group Members</div>
            <div v-if="members.length === 0 && !loading">No Members Added</div>
            <UserCard v-for="member in members" :key="member.id" :user="member" class="mb-2" no-link>
              <template #prepend>
                <div :title="member.leader ? 'Make member' : 'Make leader'" @click="toggleLeader(member)">
                  <UIcon :name="member.leader ? 'i-lucide-crown' : 'i-lucide-crown'"
                    :class="!member.leader && 'opacity-40'" :color="member.leader ? 'primary' : 'current'" />
                </div>
              </template>
              <template #append>
                <UButton icon="i-lucide-x" @click="removeMember(member.id)" class="ml-auto" />
              </template>
            </UserCard>
            <UButton icon="i-lucide-user-plus" @click="showAddMember = true">Add Member</UButton>
          </div>
          <div>
            <div v-if="!create" class="mb-6">
              <div class="font-medium mb-2">Focused Languages</div>
              <USelect v-model="state.focusedLanguages" :items="languages" multiple
                placeholder="Languages that your group usually translates to" :ui="{ content: 'min-w-fit' }">
                <template #item-label="{ item }">
                  <div class="flex flex-row items-center gap-2">
                    <LangFlag :lang="item.value" />
                    {{ item.label }}
                  </div>
                </template>
              </USelect>
            </div>
            <div class="mb-6">
              <div class="font-medium mb-2">Group Contacts</div>
              <GroupFormContactInput v-model="state" />
              <div class="font-medium mt-4 mb-2">Group Description</div>
              <UFormField>
                <UTextarea size="xl" class="w-full" v-model="state.description" label="Group Description" max="1" />
              </UFormField>
            </div>
          </div>
        </div>
        <div class="mt-10 flex gap-4">
          <UButton size="xl" color="neutral" label="Cancel" @click="router.back()" />
          <UButton size="xl" label="Save" :loading="loading" type="submit" :disabled="!hasChanged" />
        </div>
      </UForm>

      <UModal v-model:open="leaderChanged">
        <template #body>
          <div>Warning: You have passed your leader position onto someone else.</div>
        </template>
        <template #footer>
          <UButton @click="leaderChanged = false">Cancel</UButton>
          <UButton @click="() => { if (pendingData) submit(pendingData) }">Continue</UButton>
        </template>
      </UModal>

      <UModal v-model:open="showAddMember">
        <template #body>
          <GroupFormAddMembers @add="addMember" @remove="removeMember" :added="members.map(m => m.id)" />
        </template>
      </UModal>
    </div>
  </div>
</template>