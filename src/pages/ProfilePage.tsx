import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MemberProfileView } from '@/components/member/MemberProfileView'
import { getPendingRegistrationCount } from '@/lib/mockData'

const ADMIN_MENU = [
  { to: '/admin/registrations', icon: '📝', label: '入会申請' },
  { to: '/admin/members',       icon: '👥', label: '会員管理' },
  { to: '/admin/formations',    icon: '📋', label: '編成シミュレーター' },
  { to: '/admin/attendance',    icon: '✅', label: '練習出席管理' },
  { to: '/admin/announcements', icon: '📢', label: 'お知らせ管理' },
  { to: '/admin/events',        icon: '📅', label: 'イベント管理' },
  { to: '/admin/videos',        icon: '🎥', label: '練習動画管理' },
]

export default function ProfilePage() {
  const { profile, isAdmin } = useAuth()
  const pendingCount = getPendingRegistrationCount()

  if (!profile) {
    return <p className="text-center text-[var(--color-ink-muted)]">読み込み中...</p>
  }

  return (
    <div className="space-y-5">
      <MemberProfileView profile={profile} showEdit />

      {isAdmin && (
        <section className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
            ⚙️ 管理メニュー
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_MENU.map(m => {
              const showBadge = m.to === '/admin/registrations' && pendingCount > 0
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  className="relative flex items-center gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-white px-3 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                >
                  <span className="text-xl">{m.icon}</span>
                  <span>{m.label}</span>
                  {showBadge && (
                    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
