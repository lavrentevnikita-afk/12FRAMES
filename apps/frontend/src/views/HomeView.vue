<template>
  <div class="flex h-full">
    <!-- Left: projects list -->
    <div class="w-[360px] border-r border-neutral-800/80 p-6 flex flex-col gap-4 bg-neutral-950/60">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-sm font-semibold">Projects</h2>
          <p class="text-xs text-neutral-500 mt-1">Your calendars</p>
        </div>
        <button
          class="px-3 py-1.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-xs font-medium shadow-sm"
          @click="handleCreateProject"
        >
          + New
        </button>
      </div>

      <div class="flex-1 overflow-auto space-y-2">
        <button
          v-for="project in projectsStore.items"
          :key="project.id"
          class="w-full text-left px-3 py-2 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-brand-500 transition flex flex-col gap-1"
          @click="openProject(project.id)"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium truncate">{{ project.name }}</span>
            <span class="text-[10px] px-1.5 py-[2px] rounded-full bg-neutral-800 text-neutral-400">
              {{ formatShortDate(project.updatedAt) }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-neutral-500">
            <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: project.settings.primaryColor }"></span>
            <span class="truncate">{{ project.settings.titleFont }}</span>
          </div>
        </button>

        <div v-if="!projectsStore.items.length && !projectsStore.loading" class="text-xs text-neutral-500 mt-4">
          No projects yet. Create the first one.
        </div>
      </div>
    </div>

    <!-- Right: hero / hint -->
    <div class="flex-1 flex items-stretch p-8 gap-6">
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight mb-3">Calendar Image Generation</h2>
          <p class="text-sm text-neutral-400 max-w-md">
            Choose a project on the left to start editing its calendar layout. This is a lightweight prototype of the
            editor inspired by your reference UI.
          </p>
        </div>

        <div class="mt-8 grid grid-cols-3 gap-3 max-w-lg">
          <div class="aspect-[3/4] rounded-3xl bg-gradient-to-br from-brand-500/40 via-brand-600/60 to-yellow-400/30 border border-neutral-800 overflow-hidden relative">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.20),_transparent_55%)]" />
          </div>
          <div class="aspect-[3/4] rounded-3xl bg-neutral-900 border border-neutral-800/80" />
          <div class="aspect-[3/4] rounded-3xl bg-neutral-900 border border-neutral-800/80" />
        </div>
      </div>

      <div class="w-[320px] rounded-3xl bg-neutral-900/70 border border-neutral-800/80 p-5 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs uppercase tracking-[0.18em] text-neutral-500">Generation</div>
            <div class="text-sm text-neutral-300 mt-1">Quick actions</div>
          </div>
          <div class="w-8 h-8 rounded-2xl bg-neutral-800 flex items-center justify-center text-xs">✨</div>
        </div>

        <div class="space-y-2 text-xs text-neutral-400">
          <p>— Create a project to sync with backend</p>
          <p>— Open it in the editor to tweak colors and fonts</p>
          <p>— Upload a cover image (mock) for the preview</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { onMounted } from 'vue'

const projectsStore = useProjectsStore()
const router = useRouter()

onMounted(() => {
  projectsStore.loadProjects()
})

async function handleCreateProject() {
  const name = window.prompt('Project name', 'New calendar')
  if (!name) return
  const project = await projectsStore.createProject(name)
  router.push({ name: 'editor', params: { projectId: project.id } })
}

function openProject(id: string) {
  router.push({ name: 'editor', params: { projectId: id } })
}

function formatShortDate(value: string) {
  const d = new Date(value)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
