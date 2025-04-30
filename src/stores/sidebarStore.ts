import { create } from 'zustand'
import type { SidebarState } from '@/types/store-types'

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  setSidebarOpen: (isOpen: boolean) => set({ isOpen }),
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen }))
}))
