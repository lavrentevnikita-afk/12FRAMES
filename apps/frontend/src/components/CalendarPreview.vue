<template>
  <div
    class="rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 shadow-xl p-6 flex flex-col gap-4"
  >
    <div class="flex justify-between items-center mb-2">
      <div>
        <h2 class="text-sm uppercase tracking-[0.2em] text-neutral-400">Preview</h2>
        <p class="text-lg font-semibold" :style="{ fontFamily: settings.titleFont }">
          {{ title }}
        </p>
      </div>
      <div
        class="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-medium"
        :style="{ backgroundColor: settings.primaryColor }"
      >
        12
      </div>
    </div>

    <div
      class="relative rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900/60 flex flex-col"
      :style="{ backgroundColor: settings.backgroundColor }"
    >
      <div v-if="settings.coverImage" class="h-32 w-full overflow-hidden">
        <img :src="settings.coverImage" alt="Cover" class="w-full h-full object-cover" />
      </div>
      <div class="grid grid-cols-3 gap-3 p-4">
        <div
          v-for="month in 12"
          :key="month"
          class="aspect-[4/3] rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col p-3"
        >
          <div class="flex items-center justify-between text-[10px] mb-1 text-neutral-400">
            <span>Month {{ month }}</span>
            <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: settings.primaryColor }"></span>
          </div>
          <div class="flex-1 grid grid-cols-7 gap-[2px] mt-1">
            <div
              v-for="cell in 14"
              :key="cell"
              class="h-2 rounded-[3px] bg-neutral-800/80"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs text-neutral-500 mt-1">
      <span>Simple grid mockup</span>
      <span class="flex items-center gap-1">
        <span
          class="w-4 h-4 rounded-full border border-neutral-700"
          :style="{ backgroundColor: settings.primaryColor }"
        />
        Accent
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CalendarSettings } from '@/types/project'

const props = defineProps<{
  title: string
  settings: CalendarSettings
}>()
</script>
