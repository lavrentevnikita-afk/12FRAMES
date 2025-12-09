<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900">
    <div class="w-full max-w-md rounded-3xl bg-neutral-950/90 border border-neutral-800 p-8 shadow-xl">
      <h1 class="text-xl font-semibold mb-1">Welcome back</h1>
      <p class="text-xs text-neutral-500 mb-6">Log in to open your calendar projects.</p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1 text-sm">
          <label class="text-xs text-neutral-400">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div class="space-y-1 text-sm">
          <label class="text-xs text-neutral-400">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          class="w-full mt-2 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="userStore.loading"
        >
          {{ userStore.loading ? 'Signing in…' : 'Log in' }}
        </button>
      </form>

      <p class="text-[11px] text-neutral-500 mt-4 text-center">
        No account?
        <RouterLink to="/auth/register" class="text-neutral-300 hover:text-brand-500">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  await userStore.login({ email: email.value, password: password.value })
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}
</script>
