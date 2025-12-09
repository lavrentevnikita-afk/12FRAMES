import api from './api'
import type { Project } from '@/types/project'

export interface CreateProjectPayload {
  name: string
}

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/projects')
  return data
}

export async function fetchProject(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${id}`)
  return data
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await api.post<Project>('/projects', payload)
  return data
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${id}`, patch)
  return data
}
