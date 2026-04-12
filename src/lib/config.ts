export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const IS_MOCK_MODE =
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  import.meta.env.VITE_MOCK_MODE === 'true'
