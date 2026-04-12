import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  MOCK_EVENTS,
  getVisibleMembers,
  getEventResponses,
  getMemberResponse,
  getFormationsForEvent,
} from '@/lib/mockData'
import type { AttendanceStatus, Profile } from '@/types/database'
import { StatusBadge, statusLabel, type DisplayStatus } from '@/components/event/StatusBadge'

const CHOICES: { status: AttendanceStatus; label: string; cls: string }[] = [
  { status: 'attend',  label: '出席',   cls: 'bg-green-500 hover:bg-green-600' },
  { status: 'absent',  label: '欠席',   cls: 'bg-red-500 hover:bg-red-600' },
  { status: 'pending', label: '調整中', cls: 'bg-amber-500 hover:bg-amber-600' },
]

const SORT_ORDER: Record<DisplayStatus, number> = {
  attend: 1, pending: 2, absent: 3, no_reply: 4,
}

const CELL_BG: Record<DisplayStatus, string> = {
  attend:   'bg-green-100 text-green-900',
  absent:   'bg-red-100 text-red-900',
  pending:  'bg-amber-100 text-amber-900',
  no_reply: 'bg-gray-100 text-gray-600',
}

type Row = {
  member: Profile
  status: DisplayStatus
  comment: string | null
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile, isAdmin } = useAuth()

  const event = MOCK_EVENTS.find(e => e.id === id)

  const initial = useMemo(() => {
    if (!event || !profile) return { status: null as AttendanceStatus | null, comment: '' }
    const r = getMemberResponse(event.id, profile.id)
    return { status: r?.status ?? null, comment: r?.comment ?? '' }
  }, [event, profile])

  const [myStatus, setMyStatus] = useState<AttendanceStatus | null>(initial.status)
  const [comment, setComment] = useState<string>(initial.comment)

  if (!event || !profile) return <Navigate to="/events" replace />

  const responses = getEventResponses(event.id)
  const members = getVisibleMembers()
  const linkedFormations = getFormationsForEvent(event.id)

  const rows: Row[] = members.map(m => {
    if (m.id === profile.id) {
      return {
        member: m,
        status: (myStatus ?? 'no_reply') as DisplayStatus,
        comment: myStatus ? comment : null,
      }
    }
    const r = responses.find(x => x.member_id === m.id)
    return {
      member: m,
      status: (r?.status ?? 'no_reply') as DisplayStatus,
      comment: r?.comment ?? null,
    }
  })

  const countBy = (s: DisplayStatus) => rows.filter(r => r.status === s).length
  const byStatus = {
    attend:   rows.filter(r => r.status === 'attend'),
    absent:   rows.filter(r => r.status === 'absent'),
    pending:  rows.filter(r => r.status === 'pending'),
    no_reply: rows.filter(r => r.status === 'no_reply'),
  }

  const d = new Date(event.event_date)
  const dateLabel = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`

  const sortedRows = [...rows].sort((a, b) => {
    const diff = SORT_ORDER[a.status] - SORT_ORDER[b.status]
    if (diff !== 0) return diff
    return a.member.display_name.localeCompare(b.member.display_name, 'ja')
  })

  return (
    <div className="space-y-5">
      <Link
        to="/events"
        className="no-print inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← イベント一覧に戻る
      </Link>

      <div className="print-only mb-4 border-b border-black pb-2">
        <h1 className="text-lg font-bold">八幡ばやし保存会 出欠集計表</h1>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold">{event.title}</h1>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-2"><dt className="w-14 text-[var(--color-ink-muted)]">日時</dt><dd>{dateLabel} {event.event_time ?? ''}</dd></div>
          {event.location && (
            <div className="flex gap-2"><dt className="w-14 text-[var(--color-ink-muted)]">場所</dt><dd>{event.location}</dd></div>
          )}
        </dl>
        {event.description && (
          <p className="no-print mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm leading-relaxed">
            {event.description}
          </p>
        )}
        {linkedFormations.length > 0 && (
          <div className="no-print mt-3 space-y-1">
            {linkedFormations.map(f => (
              <Link
                key={f.id}
                to={`/formations/${f.id}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-3 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
              >
                📋 {f.title}の編成表を見る
                <span>›</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="no-print rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">あなたの回答</h2>
        <div className="grid grid-cols-3 gap-2">
          {CHOICES.map(c => {
            const active = myStatus === c.status
            return (
              <button
                key={c.status}
                type="button"
                onClick={() => setMyStatus(c.status)}
                className={`rounded-lg border py-3 text-sm font-bold transition ${
                  active
                    ? `${c.cls} border-transparent text-white shadow`
                    : 'border-gray-300 bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)]/50'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>
        <label className="mt-3 block">
          <span className="text-xs text-[var(--color-ink-muted)]">一言コメント（任意）</span>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            placeholder="例: 少し遅れて参加します"
          />
        </label>
      </section>

      {!isAdmin && (
        <section className="no-print rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold">回答状況</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['attend','absent','pending','no_reply'] as DisplayStatus[]).map(s => (
              <div key={s} className="rounded-lg bg-gray-50 p-2">
                <p className="text-[10px] text-[var(--color-ink-muted)]">
                  <StatusBadge status={s} />
                </p>
                <p className="mt-1 text-xl font-bold">{countBy(s)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {(['attend','absent','pending','no_reply'] as DisplayStatus[]).map(s => {
              const list = byStatus[s]
              if (list.length === 0) return null
              return (
                <div key={s}>
                  <p className="mb-1 text-xs text-[var(--color-ink-muted)]">
                    <StatusBadge status={s} /> <span className="ml-1">{list.length}人</span>
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {list.map(r => (
                      <li
                        key={r.member.id}
                        className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs"
                        title={r.comment ?? undefined}
                      >
                        {r.member.display_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {isAdmin && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:border-0 print:p-0 print:shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">出欠集計</h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print rounded-lg border border-[var(--color-primary)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary)] hover:text-white"
            >
              🖨️ 印刷する
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span>出席 <b className="text-base">{countBy('attend')}</b>人</span>
            <span>欠席 <b className="text-base">{countBy('absent')}</b>人</span>
            <span>調整中 <b className="text-base">{countBy('pending')}</b>人</span>
            <span>未回答 <b className="text-base">{countBy('no_reply')}</b>人</span>
          </div>

          <div className="overflow-x-auto">
            <table className="print-table w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-[var(--color-ink-muted)]">
                <tr>
                  <th className="px-3 py-2 w-12">No.</th>
                  <th className="px-3 py-2">名前</th>
                  <th className="px-3 py-2 w-24">回答</th>
                  <th className="px-3 py-2">コメント</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r, idx) => (
                  <tr key={r.member.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-[var(--color-ink-muted)]">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">{r.member.display_name}</td>
                    <td className={`px-3 py-2 font-bold ${CELL_BG[r.status]}`}>
                      {statusLabel(r.status)}
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--color-ink-muted)]">
                      {r.comment ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
