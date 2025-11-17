<script setup lang="ts">
withDefaults(
  defineProps<{
    groups: Array<ScanlationGroup>;
    prependIcon?: string;
    noLink?: boolean;
    lift?: boolean;
    largeIcon?: boolean;
    noIcon?: boolean;
    wrap?: boolean;
  }>(),
  {
    groups: () => [],
    prependIcon: "i-lucide-users",
  },
);

const groupLink = (g: ScanlationGroup) => {
  return `/group/${g.id}`;
};
</script>
<template>
  <div class="flex items-center">
    <UIcon
      v-if="!noIcon"
      :class="!largeIcon ? 'size-5' : 'size-10'"
      class="rounded mr-0.5 md:mr-1"
      :name="prependIcon"
    />

    <!-- :small="!largeIcon" -->

    <div :class="['flex items-center space-x-1', { wrap }]">
      <template
        v-for="(g, index) in groups.filter((g) => g.attributes)"
        :key="g.id"
      >
        <div
          v-if="noLink"
          :class="['group-tag no-hover', { lift, 'ml-1': index === 0 && wrap }]"
          :title="g.attributes.name"
        >
          {{ g.attributes.name }}
        </div>

        <NuxtLink
          v-else
          :to="groupLink(g)"
          :title="g.attributes.name"
          :class="['group-tag', { lift, 'ml-1': index === 0 && wrap }]"
        >
          {{ g.attributes.name }}
        </NuxtLink>
      </template>
    </div>

    <i v-if="groups.length === 0" class="group-tag none" title="No Group">
      No Group
    </i>
  </div>
</template>
<style lang="css" scoped>
.group-tag {
  display: -webkit-box;
  overflow: hidden;
  transition: background-color 75ms ease-in-out;
  -webkit-box-orient: vertical;
  border-radius: 0.25rem;
  -webkit-line-clamp: 1;
  word-break: break-all;
}
.group-tag,
.group-tag.none {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
.group-tag.none {
  cursor: default;
}
.wrap {
  flex-wrap: wrap;
}
.group-tag.lift:hover {
  background-color: rgb(var(--mw-accent-20-hover)) !important;
}
@media (hover: hover) {
  .group-tag:hover:not(.no-hover, .none) {
    background-color: rgb(var(--mw-accent-20-hover));
  }
}
</style>
