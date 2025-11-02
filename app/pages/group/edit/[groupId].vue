<script setup lang="ts">
import type { GroupSchema } from "~/components/group/form/index.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { loggedIn, session, isStaff } = useAuth();

const loading = ref(false);

const group = ref<ScanlationGroup>();
const groupId = ref(route.params.groupId as string);

const { leader } = useScanlationGroup(group);

const { error } = await useAsyncData(`group-${groupId.value}`, async () => {
  loading.value = true;
  const data = await $fetch<ScanlationGroup>(`/api/group/${groupId.value}`, {
    query: {
      "includes[]": "member",
    },
  });
  group.value = data;
  loading.value = false;
});

const canEdit = computed(
  () =>
    loggedIn.value && (session.value?.id === leader.value?.id || isStaff.value),
);

async function submit(e: Partial<GroupSchema>) {
  loading.value = true;
  try {
    const response = await $fetch(`/api/group/${groupId.value}`, {
      method: "PUT",
      body: {
        ...e,
      },
    });

    if (!(response.result === "ok")) {
      throw Error;
    }

    toast.add({
      title: "Success",
      description: "Your group has been edited successfully",
      color: "success",
    });
    router.push(`/group/${response.data.id}`);
    return;
  } catch (error) {
    toast.add({
      title: "Error",
      description: "An error occurred while editing the group",
      color: "error",
    });
  }
  loading.value = false;
}
</script>
<template>
  <Page title="Edit Group" wide require-auth>
    <ProseWarning v-if="!canEdit">
      You do not have permission to edit this group!
    </ProseWarning>
    <ProseCaution v-else-if="error">
      {{ error }}
    </ProseCaution>
    <GroupForm
      v-else
      ref="groupForm"
      :create="false"
      :group="group"
      :loading="loading"
      @submit="submit"
    />
  </Page>
</template>
