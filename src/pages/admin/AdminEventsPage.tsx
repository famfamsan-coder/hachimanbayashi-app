import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MOCK_EVENTS,
  getVisibleMembers,
  getEventResponses,
  type EventItem,
} from '@/lib/mockData'
import { StatusBadge, type DisplayStatus } from '@/components/event/StatusBadge'

function NewEventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-3 text-base font-bold">新規イベント作成</h3>
        <div className="space-y-3">
          {[
            { label: 'タイトル', type: 'text' },
            { label: '説明', type: 'textarea' },
            { label: '日付', type: 'date' },
            { label: '時間', type: 'text' },
            { label: '場所', type: 'text' },
          ].map(f => (
            <label key={f.label} className="block">
              <span className="text-xs text-[var(--color-ink-muted)]">{f.label}</span>
              {f.type === 'textarea' ? (
                <textarea rows={3} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              ) : (
                <input type={f.type} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              )}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded px-3 py-2 text-sm text-[var(--color-ink-muted)]">
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => { alert('モック: 作成しました'); onClose() }}
            className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  )
}

function EventAttendanceTable({ event }: { event: EventItem }) {
  const members = getVisibleMembers()
  const responses = getEventResponses(event.id)

  const rows = members.map(m => {
    const r = responses.find(x => x.member_id === m.id)
    return {
      member: m,
      status: (r?.status ?? 'no_reply') as DisplayStatus,
      comment: r?.comment ?? null,
    }
  })

  const summary = {
    attend: rows.filter(r => r.status === 'attend').length,
    absent: rows.filter(r => r.status === 'absent').length,
    pending: rows.filter(r => r.status === 'pending').length,
    no_reply: rows.filter(r => r.status === 'no_reply').length,
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2 text-xs">
        <span>出席 <b>{summary.attend}</b></span>
        <span>欠席 <b>{summary.absent}</b></span>
        <span>調整中 <b>{summary.pending}</b></span>
        <span>未回答 <b>{summary.no_reply}</b></span>
      </div>
      <div className="overflow-x-auto rounded border border-gray-100">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-left text-[10px] text-[var(--color-ink-muted)]">
            <tr>
              <th className="px-2 py-1">名前</th>
              <th className="px-2 py-1">回答</th>
              <th className="px-2 py-1">コメント</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.member.id} className="border-t border-gray-100">
                <td className="px-2 py-1">{r.member.display_name}</td>
                <td className="px-2 py-1"><StatusBadge status={r.status} /></td>
                <td className="px-2 py-1 text-[var(--color-ink-muted)]">{r.comment ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminEventsPage() {
  const [showNew, setShowNew] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Link to="/profile" className="text-sm text-[var(--color-primary)] hover:underline">
        ← マイページに戻る
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">イベント管理</h1>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          ＋ 新規作成
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_EVENTS.map(e => {
          const open = openId === e.id
          return (
            <article key={e.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold">{e.title}</h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {e.event_date} {e.event_time ?? ''}
                  </p>
                  {e.location && (
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">📍 {e.location}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : e.id)}
                  className="rounded border border-gray-300 px-2 py-0.5 text-[10px] text-[var(--color-ink-muted)]"
                >
                  {open ? '閉じる' : '集計を見る'}
                </button>
              </div>
              {open && <EventAttendanceTable event={e} />}
            </article>
          )
        })}
      </div>

      {showNew && <NewEventModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
