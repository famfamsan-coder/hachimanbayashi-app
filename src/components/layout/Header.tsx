import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { profile, signOut } = useAuth()

  return (
    <header className="no-print sticky top-0 z-30 border-b border-gray-200 bg-[var(--color-bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <h1 className="text-base font-bold text-[var(--color-primary)]">八幡ばやし保存会</h1>
        {profile && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-ink-muted)]">{profile.display_name}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-[var(--color-ink-muted)] hover:bg-gray-100"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
