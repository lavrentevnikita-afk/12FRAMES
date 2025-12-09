import { defineStore } from 'pinia'
import type { Project } from '@/types/project'
import { fetchProjects, fetchProject, createProject, updateProject } from '@/services/projects'

interface ProjectsState {
  items: Project[]
  current: Project | null
  loading: boolean
}

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    items: [],
    current: null,
    loading: false,
  }),
  actions: {
    async loadProjects() {
      this.loading = true
      try {
        this.items = await fetchProjects()
      } finally {
        this.loading = false
      }
    },
    async loadProject(id: string) {
      this.loading = true
      try {
        this.current = await fetchProject(id)
      } finally {
        this.loading = false
      }
    },
    async createProject(name: string) {
      this.loading = true
      try {
        const project = await createProject({ name })
        this.items.unshift(project)
        return project
      } finally {
        this.loading = false
      }
    },
    async updateCurrent(patch: Partial<Project>) {
      if (!this.current) return
      const updated = await updateProject(this.current.id, patch)
      this.current = updated
      const idx = this.items.findIndex(p => p.id === updated.id)
      if (idx !== -1) this.items[idx] = updated
    },
  },
})
