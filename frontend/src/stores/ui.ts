import { create } from 'zustand'

interface UIState {
  isDarkMode: boolean
  toggleDarkMode: () => void
  isDrawerOpen: boolean
  selectedDate: Date | null
  setDrawerOpen: (open: boolean) => void
  setSelectedDate: (date: Date | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  
  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode
      localStorage.setItem('darkMode', String(newMode))
      document.documentElement.classList.toggle('dark', newMode)
      return { isDarkMode: newMode }
    })
  },

  isDrawerOpen: false,
  selectedDate: null,

  setDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),
  setSelectedDate: (date: Date | null) => set({ selectedDate: date }),
}))

// Initialize dark mode on load
if (useUIStore.getState().isDarkMode) {
  document.documentElement.classList.add('dark')
}