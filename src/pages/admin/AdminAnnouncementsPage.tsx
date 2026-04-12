import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_ANNOUNCEMENTS, type Announcement } from '@/lib/mockData'

function NewAnnouncementModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [expires, setExpires] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-base font-bold">新規お知らせ投稿</h3>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">タイトル</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">本文</span>
            <textarea
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
            ピン留めする
          </label>
          <label className="block">
            <span className="text-xs text-[var(--color-ink-muted)]">表示期限（任意）</span>
            <input
              type="date"
              value={expires}
              onChange={e => setExpires(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded px-3 py-2 text-sm text-[var(--color-ink-muted)]">
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => { alert('モック: 投稿しました'); onClose() }}
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white"
          >
            投稿
          </button>
        </div>
      </div>
    </div>
  )
}

function isExpired(a: Announcement): boolean {
  return !!a.expires_at && new Date(a.expires_at).getTime() < Date.now()
}

export default function AdminAnnouncementsPage() {
  const [showNew, setShowNew] = useState(false)
  const list = [...MOCK_ANNOUNCEMENTS].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <div className="space-y-4">
      <Link to="/profile" className="text-sm text-[var(--color-primary)] hover:underline">
        ← マイページに戻る
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">お知らせ管理</h1>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          ＋ 新規投稿
        </button>
      </div>

      <div className="space-y-2">
        {list.map(a => {
          const expired = isExpired(a)
          return (
            <article
              key={a.id}
              className={`rounded-xl border p-4 shadow-sm ${
                expired ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {a.is_pinned && (
                      <span className="rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        📌
                      </span>
                    )}
                    {a.type === 'skill_achievement' && (
                      <span className="rounded bg-yellow-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        習得
                      </span>
                    )}
                    {expired && (
                      <span className="text-[10px] text-red-600">期限切れ</span>
                    )}
                  </div>
                  <h3 className="mt-1 truncate text-sm font-bold">{a.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--color-ink-muted)]">
                    {a.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => alert('編集機能はモックです')}
                    className="rounded border border-gray-300 px-2 py-0.5 text-[10px] text-[var(--color-ink-muted)]"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('削除機能はモックです')}
                    className="rounded border border-red-300 px-2 py-0.5 text-[10px] text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {showNew && <NewAnnouncementModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
