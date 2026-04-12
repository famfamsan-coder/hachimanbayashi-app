import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  MOCK_REGISTRATION_REQUESTS,
  MOCK_ANNOUNCEMENTS,
  MEMBERS,
  type RegistrationRequest,
} from '@/lib/mockData'
import type { Profile } from '@/types/database'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${hh}:${mm}`
}

export default function AdminRegistrationsPage() {
  const { profile } = useAuth()
  const [, forceUpdate] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const rerender = () => forceUpdate(n => n + 1)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const pending = MOCK_REGISTRATION_REQUESTS.filter(r => r.status === 'pending')
  const approved = MOCK_REGISTRATION_REQUESTS.filter(r => r.status === 'approved')

  const handleApprove = (req: RegistrationRequest) => {
    if (!confirm(`${req.display_name}さんを承認しますか？\n承認後、会員一覧に追加されます。`)) return

    const nowIso = new Date().toISOString()
    const newMemberId = `user-${Date.now()}`
    const newMember: Profile = {
      id: newMemberId,
      display_name: req.display_name,
      furigana: req.furigana,
      role: 'member',
      join_year: req.join_year,
      bio: null,
      avatar_url: null,
      deleted_at: null,
      created_at: nowIso,
      updated_at: nowIso,
    }
    MEMBERS.push(newMember)

    req.status = 'approved'
    req.reviewed_at = nowIso
    req.reviewed_by = profile?.id ?? null

    const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    MOCK_ANNOUNCEMENTS.unshift({
      id: `ann-${Date.now()}`,
      title: '🎉 新しい仲間が加入しました',
      body: `${req.display_name}さんが保存会に加入しました。皆さんで温かくお迎えしましょう！`,
      type: 'general',
      is_pinned: false,
      expires_at: expires,
      created_at: nowIso,
    })

    rerender()
    showToast('承認しました。実際の運用ではメールが送信されます。')
  }

  const handleDelete = (req: RegistrationRequest) => {
    if (!confirm(`${req.display_name}さんの申請を削除しますか？\nこの操作は取り消せません。`)) return
    req.status = 'deleted'
    req.reviewed_at = new Date().toISOString()
    req.reviewed_by = profile?.id ?? null
    rerender()
    showToast('削除しました。')
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">入会申請一覧</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          未承認 <span className="font-bold text-red-600">{pending.length}件</span>
        </p>
      </header>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-[var(--color-ink-muted)]">
          未承認の申請はありません。
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(req => (
            <article
              key={req.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold">{req.display_name}</h2>
                  <p className="text-xs text-[var(--color-ink-muted)]">{req.furigana}</p>
                </div>
                <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  未承認
                </span>
              </div>

              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-[var(--color-ink-muted)]">メール</dt>
                  <dd className="min-w-0 break-all">{req.email}</dd>
                </div>
                {req.join_year != null && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-[var(--color-ink-muted)]">入会年度</dt>
                    <dd>{req.join_year}年</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-[var(--color-ink-muted)]">申請日時</dt>
                  <dd>{formatDate(req.created_at)}</dd>
                </div>
                {req.message && (
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-[var(--color-ink-muted)]">メッセージ</dt>
                    <dd className="whitespace-pre-line">{req.message}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleApprove(req)}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-600"
                >
                  承認する
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(req)}
                  className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                >
                  削除する
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setShowHistory(v => !v)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-[var(--color-ink-muted)]"
        >
          <span>過去の承認履歴（{approved.length}件）</span>
          <span className="text-lg">{showHistory ? '▾' : '▸'}</span>
        </button>
        {showHistory && (
          <div className="border-t border-gray-200 p-5">
            {approved.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-ink-muted)]">
                承認履歴はまだありません。
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {approved.map(req => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{req.display_name}</div>
                      <div className="text-xs text-[var(--color-ink-muted)]">{req.email}</div>
                    </div>
                    <div className="shrink-0 text-xs text-[var(--color-ink-muted)]">
                      {req.reviewed_at ? formatDate(req.reviewed_at) : '-'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-center text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
