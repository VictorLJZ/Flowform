import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type User = {
  id: string
  email: string
}

type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
  
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
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      set({ 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
        } : null,
        isLoading: false
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  signUp: async (email, password) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      set({ 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
        } : null,
        isLoading: false
      })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  logout: async () => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      set({ user: null, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  resetPassword: async (email) => {
    const supabase = createClient()
    set({ isLoading: true, error: null })
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  setUser: (user) => {
    set({ user })
  }
}))
