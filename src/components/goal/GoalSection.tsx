import { useState } from 'react'
import {
  MOCK_GOALS,
  SONGS,
  INSTRUMENTS,
  getDancesForSong,
  getMemberGoals,
  getMemberInstrumentSkills,
  getMemberDanceSkills,
  formatGoalLabel,
  instrumentExistsForSong,
  type MemberGoal,
} from '@/lib/mockData'

const MAX_GOALS = 3

export function GoalSection({
  memberId,
  editable,
}: {
  memberId: string
  editable: boolean
}) {
  const [goals, setGoals] = useState<MemberGoal[]>(getMemberGoals(memberId))
  const [modalOpen, setModalOpen] = useState(false)

  const addGoal = (skillType: 'instrument' | 'dance', songId: string, positionId: string) => {
    if (goals.length >= MAX_GOALS) {
      alert(`目標は最大${MAX_GOALS}個までです`)
      return
    }
    const newGoal: MemberGoal = {
      id: `goal-${Date.now()}`,
      member_id: memberId,
      skill_type: skillType,
      song_id: songId,
      position_id: positionId,
      created_at: new Date().toISOString(),
      achieved: false,
      achieved_at: null,
    }
    const next = [...goals, newGoal]
    setGoals(next)
    MOCK_GOALS.push(newGoal)
  }

  const removeGoal = (id: string) => {
    if (!confirm('この目標を削除しますか？')) return
    setGoals(prev => prev.filter(g => g.id !== id))
    const idx = MOCK_GOALS.findIndex(g => g.id === id)
    if (idx >= 0) MOCK_GOALS.splice(idx, 1)
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold">🎯 目標</h3>
        {editable && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-lg border border-[var(--color-primary)] px-3 py-1 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
          >
            ＋ 設定
          </button>
        )}
      </div>

      {goals.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--color-ink-muted)]">
          目標は設定されていません
        </p>
      ) : (
        <ul className="space-y-2">
          {goals.map(g => (
            <li
              key={g.id}
              className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                g.achieved
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold">{formatGoalLabel(g)}</p>
                {g.achieved ? (
                  <p className="text-xs text-green-700">
                    ✅ 達成！（
                    {g.achieved_at
                      ? new Date(g.achieved_at).toLocaleDateString('ja-JP')
                      : '-'}
                    ）
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {new Date(g.created_at).toLocaleDateString('ja-JP')} 設定
                  </p>
                )}
              </div>
              {editable && (
                <button
                  type="button"
                  onClick={() => removeGoal(g.id)}
                  className="ml-2 shrink-0 text-xs text-red-400 hover:text-red-600"
                  aria-label="削除"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <GoalModal
          memberId={memberId}
          existingGoals={goals}
          onClose={() => setModalOpen(false)}
          onAdd={addGoal}
        />
      )}
    </section>
  )
}

function GoalModal({
  memberId,
  existingGoals,
  onClose,
  onAdd,
}: {
  memberId: string
  existingGoals: MemberGoal[]
  onClose: () => void
  onAdd: (skillType: 'instrument' | 'dance', songId: string, positionId: string) => void
}) {
  const [songId, setSongId] = useState<string | null>(null)
  const [skillType, setSkillType] = useState<'instrument' | 'dance' | null>(null)

  const ownedInst = new Set(
    getMemberInstrumentSkills(memberId).map(s => `${s.song_id}::${s.instrument_id}`),
  )
  const ownedDance = new Set(
    getMemberDanceSkills(memberId).map(s => `${s.song_id}::${s.dance_id}`),
  )
  const existingKeys = new Set(
    existingGoals.map(g => `${g.skill_type}::${g.song_id}::${g.position_id}`),
  )

  const availableInstruments = songId
    ? INSTRUMENTS.filter(
        i =>
          instrumentExistsForSong(songId, i.id) &&
          !ownedInst.has(`${songId}::${i.id}`) &&
          !existingKeys.has(`instrument::${songId}::${i.id}`),
      )
    : []

  const availableDances = songId
    ? getDancesForSong(songId).filter(
        d =>
          !ownedDance.has(`${songId}::${d.id}`) &&
          !existingKeys.has(`dance::${songId}::${d.id}`),
      )
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold">🎯 目標を設定</h3>
          <button type="button" onClick={onClose} className="text-lg">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">① 曲を選ぶ</p>
            <div className="flex flex-wrap gap-1.5">
              {SONGS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSongId(s.id)
                    setSkillType(null)
                  }}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    songId === s.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-gray-300 bg-white text-[var(--color-ink-muted)]'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {songId && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">② 種別</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSkillType('instrument')}
                  className={`rounded-lg border py-2 text-sm font-bold ${
                    skillType === 'instrument'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  🥁 楽器
                </button>
                <button
                  type="button"
                  onClick={() => setSkillType('dance')}
                  className={`rounded-lg border py-2 text-sm font-bold ${
                    skillType === 'dance'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  💃 舞
                </button>
              </div>
            </div>
          )}

          {songId && skillType === 'instrument' && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">③ 楽器を選ぶ</p>
              {availableInstruments.length === 0 ? (
                <p className="text-xs text-[var(--color-ink-muted)]">
                  選択可能な楽器がありません
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableInstruments.map(i => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => {
                        onAdd('instrument', songId, i.id)
                        onClose()
                      }}
                      className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs hover:border-[var(--color-primary)]"
                    >
                      {i.name}（{i.alias}）
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {songId && skillType === 'dance' && (
            <div>
              <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">③ 舞を選ぶ</p>
              {availableDances.length === 0 ? (
                <p className="text-xs text-[var(--color-ink-muted)]">
                  選択可能な舞がありません
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableDances.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        onAdd('dance', songId, d.id)
                        onClose()
                      }}
                      className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs hover:border-[var(--color-primary)]"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
