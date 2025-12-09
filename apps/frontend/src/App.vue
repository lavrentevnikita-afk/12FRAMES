<template>
  <div class="min-h-screen flex bg-neutral-950 text-neutral-50">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex flex-col">
      <div class="px-6 py-6 flex items-center gap-3 border-b border-neutral-800/80">
        <div
          class="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-xs font-bold"
        >
          12F
        </div>
        <div>
          <div class="text-sm font-semibold tracking-wide">12Frames</div>
          <div class="text-[11px] text-neutral-400 uppercase tracking-[0.16em]">Calendar Studio</div>
        </div>
      </div>
       
      <div v-if="isRenderLayout" class="bg-white text-black min-h-screen">
    <RouterView />
      </div>
      
      <nav class="flex-1 px-3 py-4 space-y-1 text-sm">
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-2xl text-neutral-300 hover:bg-neutral-900"
          active-class="bg-neutral-900 text-white"
        >
          <span class="w-5 h-5 rounded-xl bg-neutral-800 flex items-center justify-center text-[10px]">🏠</span>
          Home
        </RouterLink>
        <RouterLink
          to="/workshop"
          class="flex items-center gap-3 px-3 py-2 rounded-2xl text-neutral-300 hover:bg-neutral-900"
          active-class="bg-neutral-900 text-white"
        >
          <span class="w-5 h-5 rounded-xl bg-neutral-800 flex items-center justify-center text-[10px]">✨</span>
          Workshop
        </RouterLink>
      </nav>

      <div class="px-4 py-4 border-t border-neutral-800/60 text-xs text-neutral-400 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[11px]">
            {{ initials }}
          </div>
          <div v-if="userStore.profile" class="flex flex-col">
            <span class="text-[13px] text-neutral-200">{{ userStore.profile.name }}</span>
            <span class="text-[11px] text-neutral-500 truncate">{{ userStore.profile.email }}</span>
          </div>
          <span v-else class="text-[13px] text-neutral-400">Guest</span>
        </div>
        <button
          v-if="userStore.accessToken"
          class="text-[11px] text-neutral-500 hover:text-red-400 transition"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 flex flex-col">
      <header class="border-b border-neutral-800/80 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold tracking-tight">Image Generation</h1>
          <p class="text-xs text-neutral-500 mt-1">Prototype calendar editor inspired by your reference UI</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-neutral-400">
          <span class="px-2 py-1 rounded-full bg-neutral-900 border border-neutral-800">Stage 3 · Frontend</span>
        </div>
      </header>

      <section class="flex-1 overflow-auto bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterView, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const isRenderLayout = computed(() => route.meta.isRenderLayout === true)

const initials = computed(() => {
  if (!userStore.profile?.name) return '👤'
  return userStore.profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
})

function logout() {
  userStore.logout()
}

onMounted(() => {
  if (userStore.accessToken && !userStore.profile) {
    userStore.loadProfile()
  }
})
</script>
