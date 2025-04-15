import { create } from 'zustand'
import { User, AuthState as BaseAuthState } from '@/types/auth-types'
import { login as loginService } from '@/services/auth/login'
import { signUp as signUpService } from '@/services/auth/signUp'
import { logout as logoutService } from '@/services/auth/logout'
import { resetPassword as resetPasswordService } from '@/services/auth/resetPassword'

type AuthState = BaseAuthState & {
  // Actions
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null })
    
    try {
      const user = await loginService(email, password)
      set({ user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    
    try {
      const user = await signUpService(email, password)
      set({ user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null })
    
    try {
      await logoutService()
      set({ user: null, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  resetPassword: async (email) => {
    set({ isLoading: true, error: null })
    
    try {
      await resetPasswordService(email)
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  setUser: (user) => {
    set({ user })
  }
}))
