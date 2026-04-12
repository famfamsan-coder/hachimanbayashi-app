import { Link } from 'react-router-dom'
import type { Profile } from '@/types/database'
import { InitialAvatar } from '@/components/badge/InitialAvatar'
import { SpecialBadgeInlineIcons } from '@/components/badge/SpecialBadgesSection'
import { getMemberTagCount } from '@/lib/mockData'
import { getBadgeInfo } from '@/lib/constants'

export function MemberCard({ member }: { member: Profile }) {
  const tagCount = getMemberTagCount(member.id)
  const badge = getBadgeInfo(tagCount)
  return (
    <Link
      to={`/members/${member.id}`}
      className="flex items-center gap-3 px-4 py-2 transition hover:bg-gray-50"
    >
      <InitialAvatar name={member.display_name} tagCount={tagCount} size="xs" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold">{member.display_name}</span>
          <SpecialBadgeInlineIcons memberId={member.id} />
        </div>
      </div>
      <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">
        {badge.display ? badge.grade : '未習得'}
      </span>
      <span className="w-12 shrink-0 text-right text-xs text-[var(--color-ink-muted)]">
        {tagCount}タグ
      </span>
      <span className="shrink-0 text-lg leading-none text-gray-300">›</span>
    </Link>
  )
}
