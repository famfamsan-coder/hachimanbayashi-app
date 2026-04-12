import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_FORMATIONS, MOCK_EVENTS, type Formation } from '@/lib/mockData'

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>(MOCK_FORMATIONS)

  const handleDelete = (id: string) => {
    if (!confirm('この編成を削除しますか？')) return
    setFormations(prev => prev.filter(f => f.id !== id))
  }

  const handleCreate = () => {
    const newId = `form-${Date.now()}`
    const newFormation: Formation = {
      id: newId,
      title: '新しい編成',
      event_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      programs: [],
    }
    setFormations(prev => [newFormation, ...prev])
    MOCK_FORMATIONS.unshift(newFormation)
  }

  return (
    <div className="space-y-4">
      <Link
        to="/profile"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← マイページに戻る
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📋 編成シミュレーター</h1>
        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90"
        >
          ＋ 新しい編成を作る
        </button>
      </div>

      {formations.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-[var(--color-ink-muted)]">
          保存済みの編成がありません
        </p>
      ) : (
        <ul className="space-y-3">
          {formations.map(f => {
            const event = f.event_id ? MOCK_EVENTS.find(e => e.id === f.event_id) : null
            return (
              <li
                key={f.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3">
                  <h3 className="text-base font-bold">{f.title}</h3>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    {event ? `🎪 ${event.title}` : '紐づくイベントなし'}
                    <span className="mx-2">|</span>
                    演目 {f.programs.length}曲
                    <span className="mx-2">|</span>
                    更新 {new Date(f.updated_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/admin/formations/${f.id}`}
                    className="rounded-lg border border-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                  >
                    ✏️ 編集
                  </Link>
                  <Link
                    to={`/formations/${f.id}`}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-[var(--color-ink-muted)] hover:bg-gray-50"
                  >
                    👁️ 閲覧・印刷
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
