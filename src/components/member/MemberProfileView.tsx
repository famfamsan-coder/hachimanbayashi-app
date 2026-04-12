import { useState, type FormEvent } from 'react'
import type { Profile } from '@/types/database'
import { InitialAvatar } from '@/components/badge/InitialAvatar'
import { BadgeIcon } from '@/components/badge/BadgeIcon'
import { ProgressBar } from '@/components/badge/ProgressBar'
import { SkillTagList } from '@/components/skill/SkillTagList'
import { SpecialBadgesSection } from '@/components/badge/SpecialBadgesSection'
import { GoalSection } from '@/components/goal/GoalSection'
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar'
import { getMemberTagCount, MEMBERS } from '@/lib/mockData'
import { useAuth } from '@/contexts/AuthContext'
import { IS_MOCK_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabase'

const BIO_MAX = 200

export function MemberProfileView({
  profile,
  showEdit,
}: {
  profile: Profile
  showEdit: boolean
}) {
  const tagCount = getMemberTagCount(profile.id)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

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
            onClick={() => setEditing(true)}
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

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            showToast('プロフィールを更新しました')
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-center text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: Profile
  onClose: () => void
  onSaved: () => void
}) {
  const { refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [furigana, setFurigana] = useState(profile.furigana ?? '')
  const [joinYear, setJoinYear] = useState(profile.join_year?.toString() ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [errors, setErrors] = useState<{
    display_name?: string
    furigana?: string
    join_year?: string
    bio?: string
    form?: string
  }>({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const err: typeof errors = {}
    if (!displayName.trim()) err.display_name = 'お名前を入力してください'
    if (!furigana.trim()) err.furigana = 'ふりがなを入力してください'
    if (joinYear.trim()) {
      if (!/^\d{4}$/.test(joinYear.trim())) {
        err.join_year = '4桁の数値で入力してください'
      } else {
        const n = Number(joinYear.trim())
        if (n < 1950 || n > 2030) err.join_year = '1950〜2030の範囲で入力してください'
      }
    }
    if (bio.length > BIO_MAX) err.bio = `${BIO_MAX}文字以内で入力してください`
    setErrors(err)
    if (Object.keys(err).length > 0) return

    const nextJoinYear = joinYear.trim() ? Number(joinYear.trim()) : null
    const nextBio = bio.trim() || null
    const nowIso = new Date().toISOString()

    setSaving(true)

    if (!IS_MOCK_MODE && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          furigana: furigana.trim(),
          join_year: nextJoinYear,
          bio: nextBio,
          updated_at: nowIso,
        })
        .eq('id', profile.id)
      if (error) {
        setSaving(false)
        setErrors({ form: '更新に失敗しました。もう一度お試しください。' })
        return
      }
    }

    const idx = MEMBERS.findIndex(m => m.id === profile.id)
    if (idx !== -1) {
      MEMBERS[idx] = {
        ...MEMBERS[idx],
        display_name: displayName.trim(),
        furigana: furigana.trim(),
        join_year: nextJoinYear,
        bio: nextBio,
        updated_at: nowIso,
      }
    }

    await refreshProfile()
    setSaving(false)
    onSaved()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <h2 className="text-base font-bold">基本情報を編集</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5" noValidate>
          <Field label="お名前" required error={errors.display_name}>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="ふりがな" required error={errors.furigana}>
            <input
              type="text"
              value={furigana}
              onChange={e => setFurigana(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="入会年度" error={errors.join_year}>
            <input
              type="number"
              value={joinYear}
              onChange={e => setJoinYear(e.target.value)}
              min={1950}
              max={2030}
              placeholder="例: 2020"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field
            label="自己紹介"
            error={errors.bio}
            hint={`${bio.length}/${BIO_MAX}`}
          >
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={BIO_MAX + 20}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-base focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          {errors.form && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#8B4513] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-light)] disabled:opacity-60"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-medium">
        <span>
          {label}
          {required ? (
            <span className="ml-1 text-red-500">*</span>
          ) : (
            <span className="ml-1 text-xs text-[var(--color-ink-muted)]">(任意)</span>
          )}
        </span>
        {hint && <span className="text-xs text-[var(--color-ink-muted)]">{hint}</span>}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  )
}
