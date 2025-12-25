import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

interface AuthActions {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setUser: (user) =>
          set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),
        login: (user, token) =>
          set({ user, token, isAuthenticated: true }),
        logout: () => set(initialState),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
)

