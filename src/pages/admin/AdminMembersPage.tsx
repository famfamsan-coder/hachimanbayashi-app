import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getVisibleMembers, getMemberTagCount, MEMBERS } from '@/lib/mockData'
import { BadgeIcon } from '@/components/badge/BadgeIcon'
import { useAuth } from '@/contexts/AuthContext'
import type { Profile, Role } from '@/types/database'

export default function AdminMembersPage() {
  const { profile: me } = useAuth()
  const [, forceUpdate] = useState(0)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const members = getVisibleMembers()
  const rerender = () => forceUpdate(n => n + 1)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = (updated: Profile) => {
    const idx = MEMBERS.findIndex(m => m.id === updated.id)
    if (idx !== -1) {
      MEMBERS[idx] = { ...updated, updated_at: new Date().toISOString() }
    }
    setEditing(null)
    rerender()
    showToast(`${updated.display_name}さんの情報を更新しました`)
  }

  return (
    <div className="space-y-4">
      <Link to="/profile" className="text-sm text-[var(--color-primary)] hover:underline">
        ← マイページに戻る
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">会員管理</h1>
        <button
          type="button"
          onClick={() => alert('招待メールを送信しました（モック）')}
          className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          ＋ 新規会員を招待
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-[var(--color-ink-muted)]">
            <tr>
              <th className="px-3 py-2">名前</th>
              <th className="px-3 py-2">ロール</th>
              <th className="px-3 py-2">グレード</th>
              <th className="px-3 py-2">タグ</th>
              <th className="px-3 py-2">入会</th>
              <th className="px-3 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => {
              const tagCount = getMemberTagCount(m.id)
              return (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <div className="font-bold">{m.display_name}</div>
                    {m.furigana && (
                      <div className="text-[10px] text-[var(--color-ink-muted)]">{m.furigana}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {m.role === 'admin' && (
                      <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                        管理者
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2"><BadgeIcon tagCount={tagCount} size="sm" /></td>
                  <td className="px-3 py-2 text-xs">{tagCount}</td>
                  <td className="px-3 py-2 text-xs">{m.join_year ?? '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/admin/members/${m.id}/skills`}
                        className="rounded border border-[var(--color-primary)] px-2 py-0.5 text-center text-[10px] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                      >
                        スキル管理
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditing(m)}
                        className="rounded border border-gray-300 px-2 py-0.5 text-[10px] text-[var(--color-ink-muted)] hover:bg-gray-100"
                      >
                        編集
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditMemberModal
          member={editing}
          isSelf={me?.id === editing.id}
          onClose={() => setEditing(null)}
          onSave={handleSave}
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

function EditMemberModal({
  member,
  isSelf,
  onClose,
  onSave,
}: {
  member: Profile
  isSelf: boolean
  onClose: () => void
  onSave: (updated: Profile) => void
}) {
  const [displayName, setDisplayName] = useState(member.display_name)
  const [furigana, setFurigana] = useState(member.furigana ?? '')
  const [joinYear, setJoinYear] = useState(member.join_year?.toString() ?? '')
  const [bio, setBio] = useState(member.bio ?? '')
  const [role, setRole] = useState<Role>(member.role)
  const [errors, setErrors] = useState<{ display_name?: string; furigana?: string; join_year?: string }>({})

  const originalRole = member.role
  const roleChanged = role !== originalRole
  const promoting = roleChanged && role === 'admin'
  const demoting = roleChanged && role === 'member'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const err: typeof errors = {}
    if (!displayName.trim()) err.display_name = 'お名前を入力してください'
    if (!furigana.trim()) err.furigana = 'ふりがなを入力してください'
    if (joinYear && !/^\d{4}$/.test(joinYear.trim())) err.join_year = '4桁の数値で入力してください'
    setErrors(err)
    if (Object.keys(err).length > 0) return

    onSave({
      ...member,
      display_name: displayName.trim(),
      furigana: furigana.trim(),
      join_year: joinYear.trim() ? Number(joinYear.trim()) : null,
      bio: bio.trim() || null,
      role,
    })
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
          <h2 className="text-base font-bold">会員情報の編集</h2>
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="ふりがな" required error={errors.furigana}>
            <input
              type="text"
              value={furigana}
              onChange={e => setFurigana(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="入会年度" error={errors.join_year}>
            <input
              type="number"
              value={joinYear}
              onChange={e => setJoinYear(e.target.value)}
              min={1900}
              max={2100}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <Field label="自己紹介">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </Field>

          <fieldset disabled={isSelf}>
            <legend className="text-sm font-medium">役割</legend>
            <div className="mt-2 space-y-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={role === 'member'}
                  onChange={() => setRole('member')}
                  disabled={isSelf}
                />
                <span className="text-sm">一般会員</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  disabled={isSelf}
                />
                <span className="text-sm">管理者</span>
              </label>
            </div>
            {isSelf && (
              <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                自分自身のロールは変更できません
              </p>
            )}
          </fieldset>

          {promoting && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs leading-relaxed text-yellow-900">
              ⚠️ この会員に管理者権限を付与します。会員管理・お知らせ管理などすべての管理機能にアクセスできるようになります。
            </div>
          )}
          {demoting && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs leading-relaxed text-yellow-900">
              ⚠️ この会員から管理者権限を外します。管理機能にアクセスできなくなります。
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--color-primary-light)]"
            >
              保存
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
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
        {required ? (
          <span className="ml-1 text-red-500">*</span>
        ) : (
          <span className="ml-1 text-xs text-[var(--color-ink-muted)]">(任意)</span>
        )}
      </span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  )
}
