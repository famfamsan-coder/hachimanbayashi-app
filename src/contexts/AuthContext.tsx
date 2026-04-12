import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Profile } from '@/types/database'
import { getCurrentUser } from '@/lib/mockData'

// ============================================================
// モック版 AuthContext
// - どのメール/パスワードでもログイン成功
// - ログイン中ユーザーは mockData.ts の CURRENT_USER_ID で切り替え
// ============================================================

type MockSession = { user: { id: string } } | null

type AuthContextValue = {
  session: MockSession
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const STORAGE_KEY = 'mock-auth-logged-in'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  })

  const value = useMemo<AuthContextValue>(() => {
    const currentUser = getCurrentUser() ?? null
    const session: MockSession = isLoggedIn && currentUser ? { user: { id: currentUser.id } } : null
    const profile = isLoggedIn ? currentUser : null

    return {
      session,
      profile,
      loading: false,
      isAdmin: !!profile && profile.role === 'admin',
      signIn: async (_email: string, _password: string) => {
        window.localStorage.setItem(STORAGE_KEY, 'true')
        setIsLoggedIn(true)
        return { error: null }
      },
      signOut: async () => {
        window.localStorage.removeItem(STORAGE_KEY)
        setIsLoggedIn(false)
      },
      refreshProfile: async () => {},
    }
  }, [isLoggedIn])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は AuthProvider 内で使用してください')
  return ctx
}
