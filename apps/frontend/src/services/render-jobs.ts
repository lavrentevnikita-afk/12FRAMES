import api from './api'

export type RenderJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface RenderJob {
  id: string
  projectId: string | null
  ownerId: string
  status: RenderJobStatus
  resultUrl: string | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRenderJobPayload {
  format?: 'pdf' | 'png'
}

export async function createRenderJob(
  projectId: string,
  payload: CreateRenderJobPayload = { format: 'pdf' },
): Promise<RenderJob> {
  const { data } = await api.post<RenderJob>(`/projects/${projectId}/render`, payload)
  return data
}

export async function fetchRenderJob(jobId: string): Promise<RenderJob> {
  const { data } = await api.get<RenderJob>(`/render-jobs/${jobId}`)
  return data
}
