<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()
const redirect = useAuthRedirect()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  required: true
}, {
  name: 'username',
  type: 'text' as const,
  label: 'Username',
  required: false
}, {
  name: 'password',
  type: 'password' as const,
  label: 'Password',
  required: true,
}, {
  name: 'confirmPassword',
  type: 'password' as const,
  label: 'Confirm password',
  required: true,
}]

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

async function onSubmit(event: FormSubmitEvent<RegisterSchema>) {
  const response = await $fetch('/auth/register', {
    method: "POST",
    body: {
      email: event.data.email,
      username: event.data.username,
      password: event.data.password
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
  <UAuthForm :schema="registerSchema" title="Register"
  icon="i-lucide-user-plus" :fields="fields" @submit="onSubmit">
    <template #footer>
      <NuxtLink to="/login" class="hover:text-primary">
        << Back to Login</NuxtLink>
    </template>
  </UAuthForm>
</template>