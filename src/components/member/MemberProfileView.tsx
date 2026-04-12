import type { Profile } from '@/types/database'
import { InitialAvatar } from '@/components/badge/InitialAvatar'
import { BadgeIcon } from '@/components/badge/BadgeIcon'
import { ProgressBar } from '@/components/badge/ProgressBar'
import { SkillTagList } from '@/components/skill/SkillTagList'
import { SpecialBadgesSection } from '@/components/badge/SpecialBadgesSection'
import { GoalSection } from '@/components/goal/GoalSection'
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar'
import { getMemberTagCount } from '@/lib/mockData'

export function MemberProfileView({
  profile,
  showEdit,
}: {
  profile: Profile
  showEdit: boolean
}) {
  const tagCount = getMemberTagCount(profile.id)

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <InitialAvatar name={profile.display_name} tagCount={tagCount} size="xl" />
          <div className="text-center">
            <h2 className="text-xl font-bold">{profile.display_name}</h2>
            {profile.furigana && (
              <p className="text-xs text-[var(--color-ink-muted)]">{profile.furigana}</p>
            )}
          </div>
          <BadgeIcon tagCount={tagCount} size="lg" />
        </div>

        <dl className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
          {profile.join_year !== null && (
            <div className="flex justify-between">
              <dt className="text-[var(--color-ink-muted)]">入会年度</dt>
              <dd>{profile.join_year}年</dd>
            </div>
          )}
          {profile.bio && (
            <div>
              <dt className="mb-1 text-[var(--color-ink-muted)]">自己紹介</dt>
              <dd className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed">{profile.bio}</dd>
            </div>
          )}
        </dl>

        {showEdit && (
          <button
            type="button"
            onClick={() => alert('プロフィール編集機能は Phase 5 で実装予定です')}
            className="mt-4 w-full rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
          >
            基本情報を編集
          </button>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <ProgressBar tagCount={tagCount} />
      </section>

      <SpecialBadgesSection memberId={profile.id} />

      <GoalSection memberId={profile.id} editable={showEdit} />

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-bold">習得タグ</h3>
        <SkillTagList memberId={profile.id} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-base font-bold">📅 練習カレンダー</h3>
        <AttendanceCalendar memberId={profile.id} />
      </section>
    </div>
  )
}
