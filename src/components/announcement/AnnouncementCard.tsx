import type { Announcement } from '@/lib/mockData'

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const isSkill = announcement.type === 'skill_achievement'
  const remaining = isSkill ? daysUntil(announcement.expires_at) : null

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm ${
        isSkill
          ? 'border-yellow-300 bg-yellow-50 border-l-4 border-l-yellow-500'
          : 'border-gray-200 bg-white'
      }`}
    >
      {announcement.is_pinned && (
        <span className="mb-2 inline-block rounded bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
          📌 ピン留め
        </span>
      )}
      <h3 className={`text-base font-bold ${isSkill ? 'text-yellow-900' : 'text-[var(--color-ink)]'}`}>
        {announcement.title}
      </h3>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">
        {announcement.body}
      </p>
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
        <time>{new Date(announcement.created_at).toLocaleDateString('ja-JP')}</time>
        {remaining !== null && (
          <span className="text-yellow-700">あと{remaining}日間表示</span>
        )}
      </div>
    </article>
  )
}
