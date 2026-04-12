import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AnnouncementCard } from '@/components/announcement/AnnouncementCard'
import {
  MOCK_ANNOUNCEMENTS,
  getMemberTagCount,
  getPendingRegistrationCount,
} from '@/lib/mockData'
import { getBadgeInfo, TOTAL_TAGS } from '@/lib/constants'
import { getBadgeColorHex } from '@/components/badge/BadgeIcon'

export default function HomePage() {
  const { profile, isAdmin } = useAuth()
  const pendingRegCount = isAdmin ? getPendingRegistrationCount() : 0

  const tagCount = profile ? getMemberTagCount(profile.id) : 0
  const badge = getBadgeInfo(tagCount)
  const bg = getBadgeColorHex(tagCount)
  const isGradient = bg.startsWith('linear-gradient')

  const now = Date.now()
  const visible = MOCK_ANNOUNCEMENTS
    .filter(a => !a.expires_at || new Date(a.expires_at).getTime() > now)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-[var(--color-ink-muted)]">こんにちは</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-white"
            style={isGradient ? { backgroundImage: bg } : { backgroundColor: bg }}
            aria-hidden
          />
          <span className="text-lg font-bold">
            {profile?.display_name ?? 'ゲスト'} さん
          </span>
          {badge.display && (
            <>
              <span className="text-gray-300">｜</span>
              <span className="text-sm font-medium">{badge.grade}</span>
              <span className="text-gray-300">｜</span>
              <span className="text-sm text-[var(--color-ink-muted)]">
                {tagCount}/{TOTAL_TAGS} タグ
              </span>
            </>
          )}
        </div>
      </section>

      {isAdmin && pendingRegCount > 0 && (
        <Link
          to="/admin/registrations"
          className="flex items-center gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
        >
          <span className="text-2xl leading-none" aria-hidden>🔔</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-900">
              入会申請が{pendingRegCount}件届いています
            </p>
            <p className="text-xs text-amber-700/80">タップして確認</p>
          </div>
          <span className="shrink-0 text-xl leading-none text-amber-500">›</span>
        </Link>
      )}

      <section>
        <h2 className="mb-2 px-1 text-sm font-bold text-[var(--color-ink-muted)]">📣 お知らせ</h2>
        <div className="space-y-3">
          {visible.length === 0 ? (
            <p className="rounded-lg bg-white px-4 py-8 text-center text-sm text-[var(--color-ink-muted)]">
              現在お知らせはありません
            </p>
          ) : (
            visible.map(a => <AnnouncementCard key={a.id} announcement={a} />)
          )}
        </div>
      </section>
    </div>
  )
}
