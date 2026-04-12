import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (err) {
      setError('メールアドレスまたはパスワードが正しくありません。')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm space-y-5 px-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">八幡ばやし保存会</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">会員専用ページ</p>
      </div>

      <label className="block">
        <span className="text-sm font-medium">メールアドレス</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">パスワード</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
        />
      </label>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-light)] disabled:opacity-60"
      >
        {submitting ? 'ログイン中...' : 'ログイン'}
      </button>

      <p className="text-center text-xs text-[var(--color-ink-muted)]">
        パスワードを忘れた方は管理者へご連絡ください
      </p>

      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-[var(--color-ink-muted)]">はじめての方はこちら</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Link
        to="/register"
        className="block text-center text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        入会希望フォーム →
      </Link>
    </form>
  )
}
