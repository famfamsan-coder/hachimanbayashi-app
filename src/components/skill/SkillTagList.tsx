import {
  SONGS,
  getInstrumentById,
  getDanceById,
  getMemberInstrumentSkills,
  getMemberDanceSkills,
} from '@/lib/mockData'

export function SkillTagList({ memberId }: { memberId: string }) {
  const instSkills  = getMemberInstrumentSkills(memberId)
  const danceSkills = getMemberDanceSkills(memberId)

  const byInstSong = new Map<string, typeof instSkills>()
  for (const s of instSkills) {
    const arr = byInstSong.get(s.song_id) ?? []
    arr.push(s)
    byInstSong.set(s.song_id, arr)
  }
  const byDanceSong = new Map<string, typeof danceSkills>()
  for (const s of danceSkills) {
    const arr = byDanceSong.get(s.song_id) ?? []
    arr.push(s)
    byDanceSong.set(s.song_id, arr)
  }

  const hasInst  = instSkills.length > 0
  const hasDance = danceSkills.length > 0

  if (!hasInst && !hasDance) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-[var(--color-ink-muted)]">
        まだ習得タグがありません
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {hasInst && (
        <section>
          <h3 className="mb-2 flex items-center gap-1 text-sm font-bold text-[var(--color-ink)]">
            🎵 楽器スキル
            <span className="text-xs font-normal text-[var(--color-ink-muted)]">（{instSkills.length}個）</span>
          </h3>
          <div className="space-y-2">
            {SONGS.filter(s => byInstSong.has(s.id)).map(song => (
              <div key={song.id}>
                <p className="text-xs text-[var(--color-ink-muted)]">{song.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(byInstSong.get(song.id) ?? []).map(skill => {
                    const inst = getInstrumentById(skill.instrument_id)
                    if (!inst) return null
                    return (
                      <span
                        key={skill.id}
                        className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                      >
                        {inst.name}（{inst.alias}）
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasDance && (
        <section>
          <h3 className="mb-2 flex items-center gap-1 text-sm font-bold text-[var(--color-ink)]">
            💃 舞スキル
            <span className="text-xs font-normal text-[var(--color-ink-muted)]">（{danceSkills.length}個）</span>
          </h3>
          <div className="space-y-2">
            {SONGS.filter(s => byDanceSong.has(s.id)).map(song => (
              <div key={song.id}>
                <p className="text-xs text-[var(--color-ink-muted)]">{song.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(byDanceSong.get(song.id) ?? []).map(skill => {
                    const dance = getDanceById(skill.dance_id)
                    if (!dance) return null
                    return (
                      <span
                        key={skill.id}
                        className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-800"
                      >
                        {dance.name}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
