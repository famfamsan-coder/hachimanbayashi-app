import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_EVENTS, getMemberResponse, type EventItem } from '@/lib/mockData'
import { StatusBadge, type DisplayStatus } from '@/components/event/StatusBadge'

function EventRow({ event, myId }: { event: EventItem; myId: string }) {
  const resp = getMemberResponse(event.id, myId)
  const status: DisplayStatus = resp?.status ?? 'no_reply'
  const d = new Date(event.event_date)
  const dateLabel = `${d.getMonth() + 1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`

  return (
    <Link
      to={`/events/${event.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-primary)]/50 hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--color-ink-muted)]">{dateLabel} {event.event_time ?? ''}</p>
          <h3 className="truncate text-base font-bold">{event.title}</h3>
          {event.location && (
            <p className="mt-0.5 truncate text-xs text-[var(--color-ink-muted)]">📍 {event.location}</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}

export default function EventsPage() {
  const { profile } = useAuth()
  const [showPast, setShowPast] = useState(false)
  if (!profile) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = MOCK_EVENTS
    .filter(e => new Date(e.event_date) >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
  const past = MOCK_EVENTS
    .filter(e => new Date(e.event_date) < today)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))

  return (
    <div className="space-y-4">
      <section>
        <h2 className="mb-2 px-1 text-sm font-bold text-[var(--color-ink-muted)]">📅 今後のイベント</h2>
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="rounded-lg bg-white px-4 py-8 text-center text-sm text-[var(--color-ink-muted)]">
              予定されているイベントはありません
            </p>
          ) : (
            upcoming.map(e => <EventRow key={e.id} event={e} myId={profile.id} />)
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <button
            type="button"
            onClick={() => setShowPast(v => !v)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-[var(--color-ink-muted)]"
          >
            {showPast ? '▲ 過去のイベントを閉じる' : `▼ 過去のイベント（${past.length}件）を表示`}
          </button>
          {showPast && (
            <div className="mt-2 space-y-2 opacity-70">
              {past.map(e => <EventRow key={e.id} event={e} myId={profile.id} />)}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
