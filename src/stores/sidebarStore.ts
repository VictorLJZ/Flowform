import { create } from 'zustand'

type SidebarState = {
  isOpen: boolean
  setSidebarOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  setSidebarOpen: (isOpen: boolean) => set({ isOpen }),
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen }))
}))
