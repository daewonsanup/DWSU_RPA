import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Permission } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  csrfToken: string | null
  permissions: Record<string, Permission>
  setAuth: (user: User, csrfToken: string) => void
  setPermissions: (permissions: Record<string, Permission>) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      csrfToken: null,
      permissions: {},
      setAuth: (user, csrfToken) => set({ user, csrfToken, isAuthenticated: true }),
      setPermissions: (permissions) => set({ permissions }),
      logout: () => set({ user: null, isAuthenticated: false, csrfToken: null, permissions: {} }),
    }),
    {
      name: 'dwsu-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
)
