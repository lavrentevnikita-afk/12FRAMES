import { defineStore } from 'pinia'
import { loginRequest, registerRequest, fetchProfile, type LoginPayload, type RegisterPayload } from '@/services/auth'

export interface UserProfile {
  id: string
  email: string
  name: string
}

interface UserState {
  accessToken: string | null
  profile: UserProfile | null
  loading: boolean
}

const ACCESS_TOKEN_KEY = 'access_token'
const PROFILE_KEY = 'user_profile'

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    profile: localStorage.getItem(PROFILE_KEY)
      ? JSON.parse(localStorage.getItem(PROFILE_KEY) as string)
      : null,
    loading: false,
  }),
  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
    },
    setProfile(profile: UserProfile | null) {
      this.profile = profile
      if (profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      } else {
        localStorage.removeItem(PROFILE_KEY)
      }
    },
    async login(payload: LoginPayload) {
      this.loading = true
      try {
        const res = await loginRequest(payload)
        this.setAccessToken(res.access_token)
        this.setProfile(res.user)
      } finally {
        this.loading = false
      }
    },
    async register(payload: RegisterPayload) {
      this.loading = true
      try {
        const res = await registerRequest(payload)
        this.setAccessToken(res.access_token)
        this.setProfile(res.user)
      } finally {
        this.loading = false
      }
    },
    async loadProfile() {
      if (!this.accessToken) return
      this.loading = true
      try {
        const profile = await fetchProfile()
        this.setProfile(profile)
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.setAccessToken(null)
      this.setProfile(null)
    },
  },
})
