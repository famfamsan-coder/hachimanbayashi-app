import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  MOCK_FORMATIONS,
  MOCK_EVENTS,
  SONGS,
  getFormationById,
  getPositionsForSong,
  getEligibleMembersForPosition,
  getMemberResponse,
  type Formation,
  type FormationProgram,
  type FormationAssignment,
} from '@/lib/mockData'
import type { AttendanceStatus } from '@/types/database'

export default function AdminFormationEditPage() {
  const { id } = useParams<{ id: string }>()
  const initial = id ? getFormationById(id) : undefined

  const [formation, setFormation] = useState<Formation | null>(initial ?? null)
  const [showSongPicker, setShowSongPicker] = useState(false)

  if (!formation) return <Navigate to="/admin/formations" replace />

  const persist = (next: Formation) => {
    next.updated_at = new Date().toISOString()
    setFormation(next)
    const idx = MOCK_FORMATIONS.findIndex(f => f.id === next.id)
    if (idx >= 0) MOCK_FORMATIONS[idx] = next
  }

  const setTitle = (title: string) => persist({ ...formation, title })
  const setEventId = (event_id: string | null) => persist({ ...formation, event_id })

  const addProgram = (songId: string) => {
    const positions = getPositionsForSong(songId)
    const progId = `prog-${Date.now()}`
    const newProgram: FormationProgram = {
      id: progId,
      formation_id: formation.id,
      song_id: songId,
      program_order: formation.programs.length + 1,
      assignments: positions.map(p => ({
        program_id: progId,
        position_type: p.type,
        position_id: p.id,
        member_id: null,
      })),
    }
    persist({ ...formation, programs: [...formation.programs, newProgram] })
    setShowSongPicker(false)
  }

  const removeProgram = (progId: string) => {
    if (!confirm('この演目を削除しますか？')) return
    const next = formation.programs
      .filter(p => p.id !== progId)
      .map((p, i) => ({ ...p, program_order: i + 1 }))
    persist({ ...formation, programs: next })
  }

  const moveProgram = (progId: string, dir: -1 | 1) => {
    const idx = formation.programs.findIndex(p => p.id === progId)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= formation.programs.length) return
    const arr = [...formation.programs]
    ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
    const renumbered = arr.map((p, i) => ({ ...p, program_order: i + 1 }))
    persist({ ...formation, programs: renumbered })
  }

  const setAssignmentMember = (
    progId: string,
    posType: 'instrument' | 'dance',
    posId: string,
    memberId: string | null,
  ) => {
    const next = formation.programs.map(p => {
      if (p.id !== progId) return p
      return {
        ...p,
        assignments: p.assignments.map(a =>
          a.position_type === posType && a.position_id === posId
            ? { ...a, member_id: memberId }
            : a,
        ),
      }
    })
    persist({ ...formation, programs: next })
  }

  return (
    <div className="space-y-5">
      <Link
        to="/admin/formations"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← 編成一覧に戻る
      </Link>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-xs text-[var(--color-ink-muted)]">編成タイトル</span>
          <input
            type="text"
            value={formation.title}
            onChange={e => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base font-bold focus:border-[var(--color-primary)] focus:outline-none"
          />
        </label>
        <label className="mt-3 block">
          <span className="text-xs text-[var(--color-ink-muted)]">イベントに紐づけ（任意）</span>
          <select
            value={formation.event_id ?? ''}
            onChange={e => setEventId(e.target.value || null)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
          >
            <option value="">紐づけなし</option>
            {MOCK_EVENTS.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title}（{ev.event_date}）
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">🎼 演目リスト</h2>
        <button
          type="button"
          onClick={() => setShowSongPicker(v => !v)}
          className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white"
        >
          ＋ 演目を追加
        </button>
      </div>

      {showSongPicker && (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs text-[var(--color-ink-muted)]">追加する曲を選択</p>
          <div className="flex flex-wrap gap-2">
            {SONGS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => addProgram(s.id)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {formation.programs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-[var(--color-ink-muted)]">
            演目がありません。「演目を追加」から選択してください。
          </p>
        ) : (
          formation.programs.map((p, idx) => (
            <ProgramCard
              key={p.id}
              program={p}
              index={idx}
              total={formation.programs.length}
              eventId={formation.event_id}
              onRemove={() => removeProgram(p.id)}
              onMoveUp={() => moveProgram(p.id, -1)}
              onMoveDown={() => moveProgram(p.id, 1)}
              onAssign={(posType, posId, memberId) =>
                setAssignmentMember(p.id, posType, posId, memberId)
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

function ProgramCard({
  program,
  index,
  total,
  eventId,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAssign,
}: {
  program: FormationProgram
  index: number
  total: number
  eventId: string | null
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAssign: (
    posType: 'instrument' | 'dance',
    posId: string,
    memberId: string | null,
  ) => void
}) {
  const song = SONGS.find(s => s.id === program.song_id)
  const positions = useMemo(() => getPositionsForSong(program.song_id), [program.song_id])

  const missing = program.assignments.filter(a => a.member_id === null).length
  const allFilled = missing === 0 && program.assignments.length > 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--color-ink-muted)]">第{program.program_order}演目</p>
          <h3 className="truncate text-lg font-bold">{song?.name ?? '-'}</h3>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-30"
            aria-label="上へ"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-30"
            aria-label="下へ"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            削除
          </button>
        </div>
      </div>

      {allFilled ? (
        <p className="mb-3 rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-700">
          ✅ 全ポジション配置済み
        </p>
      ) : (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
          ⚠️ 未配置 {missing}件
        </p>
      )}

      <ul className="space-y-2">
        {positions.map(pos => {
          const assignment = program.assignments.find(
            a => a.position_type === pos.type && a.position_id === pos.id,
          ) as FormationAssignment | undefined

          return (
            <AssignmentRow
              key={`${pos.type}::${pos.id}`}
              songId={program.song_id}
              positionType={pos.type}
              positionId={pos.id}
              positionLabel={pos.label}
              currentMemberId={assignment?.member_id ?? null}
              eventId={eventId}
              onChange={memberId => onAssign(pos.type, pos.id, memberId)}
            />
          )
        })}
      </ul>
    </div>
  )
}

function AssignmentRow({
  songId,
  positionType,
  positionId,
  positionLabel,
  currentMemberId,
  eventId,
  onChange,
}: {
  songId: string
  positionType: 'instrument' | 'dance'
  positionId: string
  positionLabel: string
  currentMemberId: string | null
  eventId: string | null
  onChange: (memberId: string | null) => void
}) {
  const eligible = useMemo(
    () => getEligibleMembersForPosition(songId, positionType, positionId),
    [songId, positionType, positionId],
  )

  const entries = eligible.map(m => {
    let status: AttendanceStatus | null = null
    let isNoReply = false
    if (eventId) {
      const r = getMemberResponse(eventId, m.id)
      if (r) status = r.status
      else isNoReply = true
    }
    return { member: m, status, isNoReply }
  })

  const selectValue = currentMemberId ?? ''

  return (
    <li className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
      <div className="w-32 shrink-0 pt-1.5 text-xs font-bold">{positionLabel}</div>
      <div className="min-w-0 flex-1">
        <select
          value={selectValue}
          onChange={e => onChange(e.target.value || null)}
          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="">（未配置）</option>
          {entries.map(({ member, status, isNoReply }) => {
            const disabled = status === 'absent'
            let suffix = ''
            if (status === 'pending') suffix = '（調整中）'
            else if (status === 'absent') suffix = '（欠席）'
            else if (isNoReply) suffix = '（未回答）'
            return (
              <option key={member.id} value={member.id} disabled={disabled}>
                {member.display_name}
                {suffix}
              </option>
            )
          })}
        </select>
        <p className="mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
          {entries.length}人可能
          {currentMemberId === null && (
            <span className="ml-2 font-bold text-red-500">未配置</span>
          )}
        </p>
      </div>
    </li>
  )
}
