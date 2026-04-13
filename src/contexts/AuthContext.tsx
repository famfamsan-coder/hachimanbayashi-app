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
  error: string | null
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
  const [tick, setTick] = useState(0)

  const value = useMemo<AuthContextValue>(() => {
    void tick
    const currentUser = getCurrentUser() ?? null
    const session: AppSession = isLoggedIn && currentUser ? { user: { id: currentUser.id } } : null
    const profile = isLoggedIn ? currentUser : null

    return {
      session,
      profile,
      loading: false,
      error: null,
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
      refreshProfile: async () => {
        setTick(n => n + 1)
      },
    }
  }, [isLoggedIn, tick])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================
// Supabase
// ============================================================

type FetchResult = { profile: Profile | null; error: string | null }

function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  const fetchProfile = useCallback(async (userId: string): Promise<FetchResult> => {
    if (!supabase) return { profile: null, error: 'Supabase client が初期化されていません' }
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (dbError) {
      console.error('[auth] プロフィール取得エラー:', dbError)
      return {
        profile: null,
        error: `プロフィール取得に失敗しました (${dbError.code ?? 'unknown'}): ${dbError.message}`,
      }
    }
    return { profile: (data as Profile | null) ?? null, error: null }
  }, [])

  const ensureProfile = useCallback(
    async (user: { id: string; email?: string | null }): Promise<FetchResult> => {
      const first = await fetchProfile(user.id)
      if (first.error || first.profile) return first

      // 行が存在しない → デフォルトプロフィールを自動作成
      if (!supabase) return { profile: null, error: 'Supabase client が初期化されていません' }
      const defaultName = (user.email ?? '').split('@')[0] || 'メンバー'
      console.warn('[auth] profiles に該当行がないため自動作成します:', { id: user.id, defaultName })

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: user.id, display_name: defaultName, role: 'member' })
        .select('*')
        .maybeSingle()

      if (insertError) {
        console.error('[auth] プロフィール自動作成エラー:', insertError)
        const hint =
          insertError.code === '42501' || /row-level security/i.test(insertError.message)
            ? '（RLS で INSERT がブロックされている可能性があります。migration 004 を適用してください）'
            : ''
        return {
          profile: null,
          error: `プロフィール自動作成に失敗しました: ${insertError.message}${hint}`,
        }
      }
      return { profile: (data as Profile | null) ?? null, error: null }
    },
    [fetchProfile],
  )

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null)
      setError(null)
      return
    }
    const res = await ensureProfile({ id: session.user.id, email: session.user.email })
    if (!mounted.current) return
    setProfile(res.profile)
    setError(res.error)
  }, [session, ensureProfile])

  // 初期セッション取得 + 変更購読
  useEffect(() => {
    mounted.current = true
    if (!supabase) {
      setLoading(false)
      setError('Supabase client が初期化されていません')
      return
    }
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted.current) return
        setSession(data.session)
        if (!data.session) setLoading(false)
      })
      .catch(err => {
        console.error('[auth] getSession エラー:', err)
        if (!mounted.current) return
        setError(`セッション取得に失敗しました: ${err?.message ?? err}`)
        setLoading(false)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted.current) return
      setSession(newSession)
      if (!newSession) {
        setProfile(null)
        setError(null)
        setLoading(false)
      }
    })
    return () => {
      mounted.current = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // セッションが変化したらプロフィール取得（必要なら自動作成）
  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    ensureProfile({ id: session.user.id, email: session.user.email })
      .then(res => {
        if (!mounted.current) return
        setProfile(res.profile)
        setError(res.error)
      })
      .catch(err => {
        console.error('[auth] ensureProfile 例外:', err)
        if (!mounted.current) return
        setProfile(null)
        setError(`プロフィール取得中に予期せぬエラー: ${err?.message ?? err}`)
      })
      .finally(() => {
        if (mounted.current) setLoading(false)
      })
  }, [session, ensureProfile])

  const value = useMemo<AuthContextValue>(
    () => ({
      session: session?.user ? { user: { id: session.user.id } } : null,
      profile,
      loading,
      error,
      isAdmin: !!profile && profile.role === 'admin',
      signIn: async (email: string, password: string) => {
        if (!supabase) return { error: 'Supabase client 未初期化' }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        return { error: signInError?.message ?? null }
      },
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      },
      refreshProfile,
    }),
    [session, profile, loading, error, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
