import api from './api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function fetchProfile(): Promise<AuthResponse['user']> {
  const { data } = await api.get<AuthResponse['user']>('/auth/profile')
  return data
}
