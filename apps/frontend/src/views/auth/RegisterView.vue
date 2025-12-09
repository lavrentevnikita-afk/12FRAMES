<template>
  <div class="h-full flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900">
    <div class="w-full max-w-md rounded-3xl bg-neutral-950/90 border border-neutral-800 p-8 shadow-xl">
      <h1 class="text-xl font-semibold mb-1">Create account</h1>
      <p class="text-xs text-neutral-500 mb-6">Register to start building your calendars.</p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1 text-sm">
          <label class="text-xs text-neutral-400">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

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
          {{ userStore.loading ? 'Creating account…' : 'Register' }}
        </button>
      </form>

      <p class="text-[11px] text-neutral-500 mt-4 text-center">
        Already have an account?
        <RouterLink to="/auth/login" class="text-neutral-300 hover:text-brand-500">Log in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const name = ref('')
const email = ref('')
const password = ref('')

async function handleSubmit() {
  await userStore.register({ name: name.value, email: email.value, password: password.value })
  router.push('/')
}
</script>
