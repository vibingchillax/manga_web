<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()
const redirect = useAuthRedirect()

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterSchema = z.output<typeof registerSchema>

const state = reactive<Partial<RegisterSchema>>({
  email: undefined,
  username: undefined,
  password: undefined,
  confirmPassword: undefined
})
const show = ref(false)
async function onSubmit(event: FormSubmitEvent<RegisterSchema>) {
  const response = await $fetch('/auth/register', {
    method: "POST",
    body: {
      email: state.email,
      username: state.username,
      password: state.password
    }
  })
  if (response.result === 'ok') {
    toast.add({
      title: "Registered successfully",
      description: "You are now logged in",
      color: 'success'
    })
    router.push(redirect.value ?? "/")

  } else {
    toast.add({
      title: "Register failed",
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
        <UIcon name="i-lucide-user-round-plus" class="w-8 h-8 flex-shrink-0 text-gray-900 dark:text-white" />
      </div>
      <p class="text-2xl text-gray-900 dark:text-white font-bold">
        Register
      </p>
    </div>
    <div class="gap-y-6 flex flex-col">
      <UForm class="space-y-6" :schema="registerSchema" :state="state" @submit="onSubmit">

        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" class="w-full" />
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
        <UFormField label="Confirm Password" name="confirmPassword" required>
          <UInput v-model="state.confirmPassword" :type="show ? 'text' : 'password'" class="w-full"
            :ui="{ trailing: 'pe-1' }">
            <template #trailing>
              <UButton color="neutral" variant="link" size="sm" :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'" :aria-pressed="show"
                aria-controls="confirmPassword" @click="show = !show" />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" class="w-full text-center justify-center">Register</UButton>
      </UForm>
    </div>
    <p class="text-sm mt-2 text-gray-400">
      <NuxtLink to="/login" class="hover:text-primary">
        << Back to Login</NuxtLink>
    </p>
  </div>
</template>