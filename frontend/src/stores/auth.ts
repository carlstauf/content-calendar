import { create } from 'zustand'
import { api } from '@/lib/api'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  initialize: () => void
  login: (name: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  initialize: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      })
    }
  },

  login: async (name: string) => {
    const { data } = await api.post('/auth/login', { name })
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    
    set({
      token: data.token,
      user: data.user,
      isAuthenticated: true,
    })
  },

  logout: async () => {
    try {
      await api.post('/auth/signout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
}))