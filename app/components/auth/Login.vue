<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()
const redirect = useAuthRedirect()

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long")
})

type LoginSchema = z.output<typeof loginSchema>

const state = reactive<Partial<LoginSchema>>({
  email: undefined,
  password: undefined
})
const show = ref(false)
async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  const response = await $fetch('/auth/login', {
    method: "POST",
    body: {
      email: state.email,
      password: state.password
    }
  })
  if (response.result === 'ok') {
    toast.add({
      title: "Login successful",
      description: "You are now logged in",
      color: 'success'
    })
    router.push(redirect.value ?? "/")

  } else {
    toast.add({
      title: "Login failed",
      description: response.message,
      color: 'error'
    })
  }
}
</script>
<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="flex flex-col text-center">
      <div class="mb-2 pointer-events-none">
        <UIcon name="i-lucide-log-in" class="w-8 h-8 flex-shrink-0 text-gray-900 dark:text-white" />
      </div>
      <p class="text-2xl text-gray-900 dark:text-white font-bold">
        Log in to your account
      </p>
    </div>
    <div class="gap-y-6 flex flex-col">
      <UForm class="space-y-6" :schema="loginSchema" :state="state" @submit="onSubmit">

        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="Password" name="password" required>
          <UInput v-model="state.password" :type="show ? 'text' : 'password'" class="w-full" :ui="{ trailing: 'pe-1' }">
            <template #trailing>
              <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show" aria-controls="password"
                @click="show = !show" />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" class="w-full text-center justify-center">Log in</UButton>
      </UForm>
    </div>
    <p class="text-sm mt-2 text-gray-400">
      New user? <NuxtLink to="/register" class="hover:text-primary">Register</NuxtLink>
    </p>
  </div>
</template>