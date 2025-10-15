<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const router = useRouter()
const toast = useToast()
const { redirect } = useAuth()

const fields = [{
  name: 'identifier',
  type: 'text' as const,
  label: 'Email or Username',
  required: true
}, {
  name: 'password',
  type: 'password' as const,
  label: 'Password',
  required: true
}]

const loginSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters long")
})

type LoginSchema = z.output<typeof loginSchema>

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  const response = await $fetch('/api/auth/login', {
    method: "POST",
    body: {
      identifier: event.data.identifier,
      password: event.data.password
    }
  })
  if (response.result === 'ok') {
    toast.add({
      title: "Login successful",
      description: "You are now logged in",
      color: 'success'
    })
    await useAuth().fetch()
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
  <UAuthForm :schema="loginSchema" title="Login"
    description="Enter your credentials to access your account."
    icon="i-lucide-log-in" :fields="fields" @submit="onSubmit">
    <template #footer>
      New user? <NuxtLink to="/register" class="hover:text-primary">Register</NuxtLink>
    </template>
  </UAuthForm>
</template>