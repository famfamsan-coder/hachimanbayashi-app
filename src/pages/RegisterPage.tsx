import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  MOCK_REGISTRATION_REQUESTS,
  type RegistrationRequest,
} from '@/lib/mockData'
import { IS_MOCK_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabase'

type FormState = {
  display_name: string
  furigana: string
  email: string
  join_year: string
  message: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const { session, loading } = useAuth()
  const [form, setForm] = useState<FormState>({
    display_name: '',
    furigana: '',
    email: '',
    join_year: '2026',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (loading) {
    return <div className="flex h-full items-center justify-center">読み込み中...</div>
  }
  // ログイン済みユーザーはトップへリダイレクト
  if (session) return <Navigate to="/" replace />

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.display_name.trim()) e.display_name = 'お名前を入力してください'
    if (!form.furigana.trim()) e.furigana = 'ふりがなを入力してください'
    if (!form.email.trim()) e.email = 'メールアドレスを入力してください'
    else if (!EMAIL_RE.test(form.email.trim()))
      e.email = 'メールアドレスの形式が正しくありません'
    if (form.join_year && !/^\d{4}$/.test(form.join_year.trim()))
      e.join_year = '4桁の数値で入力してください'
    return e
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    const eObj = validate()
    setErrors(eObj)
    if (Object.keys(eObj).length > 0) return

    setSubmitting(true)

    const payload = {
      display_name: form.display_name.trim(),
      furigana: form.furigana.trim(),
      email: form.email.trim(),
      join_year: form.join_year ? Number(form.join_year) : null,
      message: form.message.trim() || null,
    }

    if (IS_MOCK_MODE || !supabase) {
      await new Promise(r => setTimeout(r, 500))
      const newRequest: RegistrationRequest = {
        id: `reg-${Date.now()}`,
        ...payload,
        status: 'pending',
        created_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
      }
      MOCK_REGISTRATION_REQUESTS.unshift(newRequest)
    } else {
      // anonロールは登録後の行をSELECTで読み返せない（管理者のみ閲覧ポリシー）ため、
      // .select() を付けるとPostgRESTが「new row violates RLS」と誤認識する。
      // 挿入成功の可否だけ確認すればよいので .select() は付けない。
      const { error } = await supabase
        .from('registration_requests')
        .insert(payload)
      if (error) {
        setSubmitting(false)
        setErrors({ email: `送信に失敗しました: ${error.message}` })
        return
      }
    }

    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="text-xl font-bold">入会希望を送信しました</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {`管理者が内容を確認し、承認されると
ご登録のメールアドレスにご案内が届きます。
しばらくお待ちください。`}
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg border border-[var(--color-primary)] px-5 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/login"
          className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
        >
          ← ログインに戻る
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">八幡ばやし保存会</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">入会希望フォーム</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <Field label="お名前" required error={errors.display_name}>
            <input
              type="text"
              value={form.display_name}
              onChange={e => setForm({ ...form, display_name: e.target.value })}
              placeholder="例: 渡辺 裕子"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="ふりがな" required error={errors.furigana}>
            <input
              type="text"
              value={form.furigana}
              onChange={e => setForm({ ...form, furigana: e.target.value })}
              placeholder="例: わたなべ ゆうこ"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="メールアドレス" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="例: watanabe@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="入会年度" error={errors.join_year}>
            <input
              type="number"
              value={form.join_year}
              onChange={e => setForm({ ...form, join_year: e.target.value })}
              min={1900}
              max={2100}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="一言メッセージ">
            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              rows={3}
              placeholder="例: 友人からの紹介で入会希望です。"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-light)] disabled:opacity-60"
          >
            {submitting ? '送信中...' : '入会希望を送信する'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : <span className="ml-1 text-xs text-[var(--color-ink-muted)]">(任意)</span>}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  )
}
