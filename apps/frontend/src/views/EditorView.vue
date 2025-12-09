<template>
  <div class="h-full flex">
    <!-- Settings panel -->
    <div class="w-[360px] border-r border-neutral-800/80 bg-neutral-950/70 p-6 flex flex-col gap-6">
      <div>
        <h2 class="text-sm font-semibold">Calendar settings</h2>
        <p class="text-xs text-neutral-500 mt-1">
          Configure base colors, fonts and cover image. Changes are saved to backend.
        </p>
      </div>

      <div v-if="project" class="space-y-5 text-sm">
        <!-- Colors -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400">Primary color</span>
            <input
              v-model="draft.settings.primaryColor"
              type="color"
              class="w-10 h-6 rounded-md border border-neutral-700 bg-neutral-900"
              @change="save"
            />
          </div>
          <input
            v-model="draft.settings.primaryColor"
            type="text"
            class="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs"
            @blur="save"
          />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs text-neutral-400">Background</span>
            <input
              v-model="draft.settings.backgroundColor"
              type="color"
              class="w-10 h-6 rounded-md border border-neutral-700 bg-neutral-900"
              @change="save"
            />
          </div>
          <input
            v-model="draft.settings.backgroundColor"
            type="text"
            class="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-1.5 text-xs"
            @blur="save"
          />
        </div>

        <!-- Font -->
        <div class="space-y-2">
          <span class="text-xs text-neutral-400">Title font</span>
          <select
            v-model="draft.settings.titleFont"
            class="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-3 py-2 text-xs"
            @change="save"
          >
            <option value="'Inter', system-ui">Inter</option>
            <option value="'DM Sans', system-ui">DM Sans</option>
            <option value="'SF Pro Text', system-ui">SF Pro</option>
          </select>
        </div>

        <!-- Mock image upload -->
        <div class="space-y-2">
          <span class="text-xs text-neutral-400">Cover image (mock)</span>
          <label
            class="flex items-center justify-between gap-3 rounded-2xl bg-neutral-900 border border-dashed border-neutral-700 px-3 py-3 text-xs cursor-pointer hover:border-brand-500 hover:bg-neutral-900/80 transition"
          >
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-xl bg-neutral-800 flex items-center justify-center text-[11px]">📁</span>
              <span class="text-neutral-300">Upload image</span>
            </div>
            <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
            <span class="text-[11px] text-neutral-500">local preview only</span>
          </label>

          <div v-if="draft.settings.coverImage" class="relative mt-2">
            <img
              :src="draft.settings.coverImage"
              alt="Cover preview"
              class="w-full h-32 object-cover rounded-2xl border border-neutral-800"
            />
            <button
              class="absolute top-2 right-2 text-[10px] px-2 py-[2px] rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-300"
              @click="clearImage"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-xs text-neutral-500">Loading project…</div>
    </div>

    <!-- Calendar preview -->
    <div class="flex-1 p-8">
      <div class="max-w-5xl mx-auto h-full flex gap-6">
        <div class="flex-1 flex items-center">
          <CalendarPreview
            v-if="project"
            :title="project.name"
            :settings="draft.settings"
          />
        </div>
        <div class="w-[260px] flex flex-col gap-4">
          <div class="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-4 text-xs text-neutral-400 space-y-2">
            <div class="flex items-center justify-between mb-1">
              <span class="uppercase tracking-[0.18em] text-[10px] text-neutral-500">Generation</span>
              <span class="w-6 h-6 rounded-2xl bg-neutral-800 flex items-center justify-center text-[11px]">…</span>
            </div>
            <p>Each tweak is persisted via API so backend stays in sync with your editor state.</p>
            <p class="text-[11px] text-neutral-500">
              In this stage it is a visual prototype — image uploads are local only.
            </p>
          </div>

          <div class="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-4 text-xs text-neutral-400 space-y-3">
            <div class="flex items-center justify-between mb-1">
              <span class="uppercase tracking-[0.18em] text-[10px] text-neutral-500">Export</span>
            </div>

            <button
              class="w-full inline-flex items-center justify-center rounded-2xl px-3 py-2 text-xs font-medium bg-neutral-50 text-neutral-900 disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="!project || isExporting"
              @click="exportPdf"
            >
              <span v-if="!isExporting">Export PDF</span>
              <span v-else class="inline-flex items-center gap-2">
                <span
                  class="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin"
                />
                Generating PDF…
              </span>
            </button>

            <div v-if="hasResult" class="text-[11px] text-neutral-400 space-y-1">
              <p class="text-neutral-500">Your export is ready.</p>
              <a
                :href="renderState.resultUrl || undefined"
                class="inline-flex items-center gap-1 text-xs text-neutral-100 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download PDF
              </a>
            </div>

            <p v-if="renderState.status === 'failed' && renderState.error" class="text-[11px] text-red-400">
              {{ renderState.error }}
            </p>

            <p v-else-if="renderState.status === 'failed'" class="text-[11px] text-red-400">
              Export failed. Please try again.
            </p>

            <p v-else-if="isExporting && !hasResult" class="text-[11px] text-neutral-500">
              Generating PDF on server…
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import CalendarPreview from '@/components/CalendarPreview.vue'
import { createRenderJob, fetchRenderJob, type RenderJob, type RenderJobStatus } from '@/services/render-jobs'
import type { Project } from '@/types/project'

const route = useRoute()
const projectsStore = useProjectsStore()

const renderState = reactive<{
  jobId: string | null
  status: RenderJobStatus | 'idle'
  resultUrl: string | null
  error: string | null
}>({
  jobId: null,
  status: 'idle',
  resultUrl: null,
  error: null,
})

const pollIntervalId = ref<number | null>(null)

const isExporting = computed(
  () => renderState.status === 'pending' || renderState.status === 'processing',
)

const hasResult = computed(
  () => renderState.status === 'completed' && !!renderState.resultUrl,
)

function startPolling(jobId: string) {
  renderState.jobId = jobId
  if (pollIntervalId.value) {
    clearInterval(pollIntervalId.value)
    pollIntervalId.value = null
  }

  pollIntervalId.value = window.setInterval(async () => {
    try {
      const job = await fetchRenderJob(jobId)
      renderState.status = job.status
      renderState.resultUrl = job.resultUrl
      renderState.error = job.error

      if (job.status === 'completed' || job.status === 'failed') {
        if (pollIntervalId.value) {
          clearInterval(pollIntervalId.value)
          pollIntervalId.value = null
        }
      }
    } catch (error) {
      renderState.error = 'Failed to fetch render status'
      if (pollIntervalId.value) {
        clearInterval(pollIntervalId.value)
        pollIntervalId.value = null
      }
    }
  }, 2000)
}

async function exportPdf() {
  if (!projectId) return

  renderState.status = 'pending'
  renderState.error = null
  renderState.resultUrl = null

  try {
    const job = await createRenderJob(projectId, { format: 'pdf' })
    renderState.status = job.status
    renderState.jobId = job.id
    startPolling(job.id)
  } catch (error) {
    renderState.status = 'failed'
    renderState.error = 'Failed to start export'
  }
}

onUnmounted(() => {
  if (pollIntervalId.value) {
    clearInterval(pollIntervalId.value)
    pollIntervalId.value = null
  }
})

const draft = reactive<Project>({
  id: '',
  name: '',
  createdAt: '',
  updatedAt: '',
  settings: {
    primaryColor: '#ff6a3d',
    backgroundColor: '#050509',
    titleFont: "'Inter', system-ui",
    coverImage: null,
  },
})

const projectId = route.params.projectId as string

onMounted(async () => {
  await projectsStore.loadProject(projectId)
  if (project) {
    Object.assign(draft, JSON.parse(JSON.stringify(project)))
  }
})

const project = computed(() => projectsStore.current)

watch(
  () => projectsStore.current,
  (val) => {
    if (val) Object.assign(draft, JSON.parse(JSON.stringify(val)))
  },
)

async function save() {
  if (!project) return
  await projectsStore.updateCurrent({
    settings: draft.settings,
  } as Partial<Project>)
}

function onImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    draft.settings.coverImage = reader.result as string
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  draft.settings.coverImage = null
}
</script>
