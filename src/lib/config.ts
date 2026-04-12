export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const IS_MOCK_MODE =
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  import.meta.env.VITE_MOCK_MODE === 'true'

// TODO: 動作確認後に削除
if (typeof window !== 'undefined') {
  console.log('[config] IS_MOCK_MODE:', IS_MOCK_MODE)
  console.log('[config] VITE_SUPABASE_URL set:', !!SUPABASE_URL)
  console.log('[config] VITE_SUPABASE_ANON_KEY set:', !!SUPABASE_ANON_KEY)
  console.log('[config] VITE_MOCK_MODE:', import.meta.env.VITE_MOCK_MODE)
}
