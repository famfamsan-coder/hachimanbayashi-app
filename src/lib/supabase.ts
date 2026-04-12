import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { IS_MOCK_MODE, SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

export const supabase: SupabaseClient | null = IS_MOCK_MODE
  ? null
  : createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase client is not available (mock mode)')
  }
  return supabase
}
