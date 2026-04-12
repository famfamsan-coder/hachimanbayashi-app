import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  SONGS,
  INSTRUMENTS,
  SONG_DANCES,
  getMemberById,
  getMemberInstrumentSkills,
  getMemberDanceSkills,
  getSongById,
  getDanceById,
  instrumentExistsForSong,
} from '@/lib/mockData'
import { TOTAL_TAGS } from '@/lib/constants'
import { BadgeIcon } from '@/components/badge/BadgeIcon'
import { InitialAvatar } from '@/components/badge/InitialAvatar'

type InstKey = string  // "songId::instrumentId"
type DanceKey = string // "songId::danceId"

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-xs rounded-full bg-[var(--color-primary)] px-4 py-2 text-center text-xs text-white shadow-lg">
      {message}
      <button type="button" onClick={onClose} className="ml-2 opacity-70">×</button>
    </div>
  )
}

export default function AdminMemberSkillsPage() {
  const { id } = useParams<{ id: string }>()
  const member = id ? getMemberById(id) : undefined

  const initialInst = useMemo<Set<InstKey>>(() => {
    if (!id) return new Set()
    return new Set(
      getMemberInstrumentSkills(id).map(s => `${s.song_id}::${s.instrument_id}`),
    )
  }, [id])

  const initialDance = useMemo<Set<DanceKey>>(() => {
    if (!id) return new Set()
    return new Set(
      getMemberDanceSkills(id).map(s => `${s.song_id}::${s.dance_id}`),
    )
  }, [id])

  const [instSet, setInstSet] = useState<Set<InstKey>>(initialInst)
  const [danceSet, setDanceSet] = useState<Set<DanceKey>>(initialDance)
  const [toast, setToast] = useState<string | null>(null)

  if (!member) return <Navigate to="/admin/members" replace />

  const tagCount = instSet.size + danceSet.size

  const toggleInst = (songId: string, instId: string) => {
    const key = `${songId}::${instId}`
    const next = new Set(instSet)
    if (next.has(key)) {
      if (!confirm('このスキルを削除しますか？')) return
      next.delete(key)
    } else {
      next.add(key)
      const song = getSongById(songId)!
      const inst = INSTRUMENTS.find(i => i.id === instId)!
      setToast(`おめでとう通知を投稿: ${song.name} × ${inst.name}（${inst.alias}）`)
      setTimeout(() => setToast(null), 3000)
    }
    setInstSet(next)
  }

  const toggleDance = (songId: string, danceId: string) => {
    const key = `${songId}::${danceId}`
    const next = new Set(danceSet)
    if (next.has(key)) {
      if (!confirm('このスキルを削除しますか？')) return
      next.delete(key)
    } else {
      next.add(key)
      const song = getSongById(songId)!
      const dance = getDanceById(danceId)!
      setToast(`おめでとう通知を投稿: ${song.name} × ${dance.name}`)
      setTimeout(() => setToast(null), 3000)
    }
    setDanceSet(next)
  }

  return (
    <div className="space-y-5">
      <Link to="/admin/members" className="text-sm text-[var(--color-primary)] hover:underline">
        ← 会員管理に戻る
      </Link>

      <section className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <InitialAvatar name={member.display_name} tagCount={tagCount} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{member.display_name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <BadgeIcon tagCount={tagCount} size="sm" />
            <span className="text-xs text-[var(--color-ink-muted)]">{tagCount} / {TOTAL_TAGS} タグ</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">🥁 曲 × 楽器</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left"></th>
                {INSTRUMENTS.map(i => (
                  <th key={i.id} className="p-2 font-medium text-[var(--color-ink-muted)]">
                    {i.alias}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SONGS.map(s => (
                <tr key={s.id} className="border-t border-gray-100">
                  <th className="p-2 text-left text-xs font-medium">{s.name}</th>
                  {INSTRUMENTS.map(i => {
                    if (!instrumentExistsForSong(s.id, i.id)) {
                      return (
                        <td key={i.id} className="bg-gray-100 p-2 text-gray-300" aria-hidden>
                          −
                        </td>
                      )
                    }
                    const key = `${s.id}::${i.id}`
                    const checked = instSet.has(key)
                    return (
                      <td key={i.id} className="p-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleInst(s.id, i.id)}
                          className="h-5 w-5 cursor-pointer accent-[var(--color-primary)]"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold">💃 曲 × 舞</h2>
        <ul className="space-y-2">
          {SONG_DANCES.map(sd => {
            const key = `${sd.song_id}::${sd.dance_id}`
            const checked = danceSet.has(key)
            const song = getSongById(sd.song_id)!
            const dance = getDanceById(sd.dance_id)!
            return (
              <li key={key} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleDance(sd.song_id, sd.dance_id)}
                  className="h-5 w-5 cursor-pointer accent-[var(--color-primary)]"
                />
                <span className="text-sm">{song.name} × {dance.name}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
