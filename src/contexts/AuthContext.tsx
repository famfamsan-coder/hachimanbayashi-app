import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { IS_MOCK_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/mockData'

// ============================================================
// AuthContext — モック / Supabase の両対応
// - IS_MOCK_MODE: どのメール/パスワードでもログイン成功 + CURRENT_USER_ID で切り替え
// - それ以外:     Supabase Auth を使用
// ============================================================

type AppSession = { user: { id: string } } | null

type AuthContextValue = {
  session: AppSession
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  if (IS_MOCK_MODE) return <MockAuthProvider>{children}</MockAuthProvider>
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth は AuthProvider 内で使用してください')
  return ctx
}

// ============================================================
// モック
// ============================================================

const STORAGE_KEY = 'mock-auth-logged-in'

function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  })

  const value = useMemo<AuthContextValue>(() => {
    const currentUser = getCurrentUser() ?? null
    const session: AppSession = isLoggedIn && currentUser ? { user: { id: currentUser.id } } : null
    const profile = isLoggedIn ? currentUser : null

    return {
      session,
      profile,
      loading: false,
      isAdmin: !!profile && profile.role === 'admin',
      signIn: async () => {
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

// ============================================================
// Supabase
// ============================================================

function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!supabase) return null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.error('プロフィール取得エラー:', error.message)
      return null
    }
    return (data as Profile | null) ?? null
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    const p = await fetchProfile(session.user.id)
    if (mounted.current) setProfile(p)
  }, [session, fetchProfile])

  // 初期セッション取得 + 変更購読
  useEffect(() => {
    mounted.current = true
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return
      setSession(data.session)
      if (!data.session) {
        setLoading(false)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted.current) return
      setSession(newSession)
      if (!newSession) {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => {
      mounted.current = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // セッションが変化したらプロフィール取得
  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      return
    }
    setLoading(true)
    fetchProfile(session.user.id).then(p => {
      if (!mounted.current) return
      setProfile(p)
      setLoading(false)
    })
  }, [session, fetchProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      session: session?.user ? { user: { id: session.user.id } } : null,
      profile,
      loading,
      isAdmin: !!profile && profile.role === 'admin',
      signIn: async (email: string, password: string) => {
        if (!supabase) return { error: 'Supabase client 未初期化' }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      },
      refreshProfile,
    }),
    [session, profile, loading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
