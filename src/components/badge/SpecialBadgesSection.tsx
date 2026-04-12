import {
  SPECIAL_BADGES,
  buildMemberSkillSet,
  getEarnedBadges,
} from '@/lib/constants'
import {
  getMemberInstrumentSkills,
  getMemberDanceSkills,
} from '@/lib/mockData'

export function SpecialBadgesSection({ memberId }: { memberId: string }) {
  const skillSet = buildMemberSkillSet(
    getMemberInstrumentSkills(memberId),
    getMemberDanceSkills(memberId),
  )
  const earned = new Set(getEarnedBadges(skillSet).map(b => b.id))

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold">🏅 称号</h3>
        <span className="text-xs text-[var(--color-ink-muted)]">
          <b className="text-base text-[var(--color-ink)]">{earned.size}</b> / {SPECIAL_BADGES.length}
        </span>
      </div>

      {earned.size === 0 ? (
        <p className="mb-3 text-xs text-[var(--color-ink-muted)]">
          まだ称号を獲得していません。スキルを習得すると自動で獲得できます。
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SPECIAL_BADGES.map(b => {
          const isEarned = earned.has(b.id)
          return (
            <li
              key={b.id}
              title={b.description}
              className={`flex items-center gap-2 rounded-lg border p-2 text-xs ${
                isEarned
                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}
            >
              <span className={`text-xl ${isEarned ? '' : 'grayscale opacity-40'}`}>
                {b.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-bold ${isEarned ? 'text-amber-900' : ''}`}>
                  {b.name}
                </p>
                <p className="truncate text-[10px] leading-tight">{b.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// メンバー一覧用の小さなアイコン表示
export function SpecialBadgeInlineIcons({
  memberId,
  max = 3,
}: {
  memberId: string
  max?: number
}) {
  const skillSet = buildMemberSkillSet(
    getMemberInstrumentSkills(memberId),
    getMemberDanceSkills(memberId),
  )
  const earned = getEarnedBadges(skillSet)
  if (earned.length === 0) return null
  const shown = earned.slice(0, max)
  const rest = earned.length - shown.length
  return (
    <span className="inline-flex items-center gap-0.5">
      {shown.map(b => (
        <span key={b.id} title={b.name} className="text-xs">
          {b.icon}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10px] text-[var(--color-ink-muted)]">+{rest}</span>
      )}
    </span>
  )
}
