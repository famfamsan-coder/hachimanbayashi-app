import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getHydrateError } from '@/lib/hydrate'

export function AppShell() {
  const { error: authError } = useAuth()
  const hydrateErr = getHydrateError()
  const messages = [authError, hydrateErr].filter(Boolean) as string[]

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      {messages.length > 0 && (
        <div className="mx-auto w-full max-w-xl px-4 pt-3">
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
          >
            <p className="mb-1 font-bold">⚠️ データ取得エラー</p>
            <ul className="list-disc space-y-1 pl-5">
              {messages.map((m, i) => (
                <li key={i} className="break-words">{m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
