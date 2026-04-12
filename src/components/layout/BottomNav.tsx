import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getPendingRegistrationCount } from '@/lib/mockData'

const items = [
  { to: '/',         label: 'ホーム',   icon: '🏠' },
  { to: '/members',  label: 'メンバー', icon: '👥' },
  { to: '/practice', label: '練習',     icon: '🎵' },
  { to: '/events',   label: 'イベント', icon: '📅' },
  { to: '/profile',  label: 'マイ',     icon: '👤' },
]

export function BottomNav() {
  const { isAdmin } = useAuth()
  const showProfileDot = isAdmin && getPendingRegistrationCount() > 0

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs transition ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-ink-muted)]'
                }`
              }
            >
              <span className="relative text-xl leading-none">
                {item.icon}
                {item.to === '/profile' && showProfileDot && (
                  <span
                    aria-label="未承認の入会申請あり"
                    className="absolute top-0.5 left-1/2 ml-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
                  />
                )}
              </span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
