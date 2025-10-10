<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const duration = defineModel<string>('duration', { type: String, required: true, default: "P0D" })

const parsed = ref<any>(null)
const years = ref(0)
const months = ref(0)
const weeks = ref(0)
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

function parseDuration(str: string) {
  // ISO 8601 duration like "P1DT2H" → { days: 1, hours: 2 }
  const regex =
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const match = str.match(regex)
  if (!match) return null

  const [, y, mo, w, d, h, mi, s] = match.map((n) => (n ? parseInt(n) : 0))
  return {
    years: y || 0,
    months: mo || 0,
    weeks: w || 0,
    days: d || 0,
    hours: h || 0,
    minutes: mi || 0,
    seconds: s || 0
  }
}

function buildDuration(seconds: number, minutes: number, hours: number, days: number) {
  const parts: string[] = []
  if (days) parts.push(`${days}D`)
  const time: string[] = []
  if (hours) time.push(`${hours}H`)
  if (minutes) time.push(`${minutes}M`)
  if (seconds) time.push(`${seconds}S`)

  return `P${parts.join("")}${time.length ? "T" + time.join("") : ""}` || "P0D"
}

onMounted(() => {
  parsed.value = parseDuration(duration.value)
  if (parsed.value) {
    years.value = parsed.value.years
    months.value = parsed.value.months
    weeks.value = parsed.value.weeks
    days.value = parsed.value.days
    hours.value = parsed.value.hours
    minutes.value = parsed.value.minutes
    seconds.value = parsed.value.seconds
  }
})

function updateModel() {
  if (props.disabled) return
  duration.value = buildDuration(seconds.value, minutes.value, hours.value, days.value)
}

watch(() => duration, (newDuration) => {
  const v = parseDuration(newDuration.value)
  if (v) {
    years.value = v.years
    months.value = v.months
    weeks.value = v.weeks
    days.value = v.days
    hours.value = v.hours
    minutes.value = v.minutes
    seconds.value = v.seconds
  }
})

watch(days, updateModel)
watch(hours, updateModel)
</script>
<template>
  <div class="p-2 inline-block" :class="{ disabled: props.disabled }">
    <div class="flex gap-2 items-end">
      <div class="flex flex-col items-stretch">
        <UInputNumber size="xl" v-model="days" orientation="vertical" :min="0" :disabled="props.disabled"
          aria-label="Days" />
        <div class="text-xs text-muted text-center mt-1">days</div>
      </div>

      <div class="flex flex-col items-stretch">
        <UInputNumber size="xl" v-model="hours" orientation="vertical" :min="0" :disabled="props.disabled"
          aria-label="Hours" />
        <div class="text-xs text-muted text-center mt-1">hours</div>
      </div>

    </div>
  </div>
</template>
<style scoped lang="css">
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
