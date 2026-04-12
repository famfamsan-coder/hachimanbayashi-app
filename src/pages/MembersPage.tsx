import { useMemo, useState } from 'react'
import { MemberCard } from '@/components/member/MemberCard'
import {
  MemberFilter,
  EMPTY_FILTERS,
  hasAnyFilter,
  buildFilterSummary,
  type MemberFilters,
} from '@/components/member/MemberFilter'
import {
  getVisibleMembers,
  getMemberInstrumentSkills,
  getMemberDanceSkills,
  getMemberTagCount,
} from '@/lib/mockData'
import { getBadgeInfo } from '@/lib/constants'

export default function MembersPage() {
  const [filters, setFilters] = useState<MemberFilters>(EMPTY_FILTERS)
  const [expanded, setExpanded] = useState(false)

  const filtered = useMemo(() => {
    const list = getVisibleMembers().filter(m => {
      const inst = getMemberInstrumentSkills(m.id)
      const dance = getMemberDanceSkills(m.id)

      if (filters.songId) {
        const hasSong =
          inst.some(s => s.song_id === filters.songId) ||
          dance.some(s => s.song_id === filters.songId)
        if (!hasSong) return false
      }
      if (filters.instrumentId) {
        const ok =
          filters.songId
            ? inst.some(s => s.instrument_id === filters.instrumentId && s.song_id === filters.songId)
            : inst.some(s => s.instrument_id === filters.instrumentId)
        if (!ok) return false
      }
      if (filters.danceId) {
        const ok =
          filters.songId
            ? dance.some(s => s.dance_id === filters.danceId && s.song_id === filters.songId)
            : dance.some(s => s.dance_id === filters.danceId)
        if (!ok) return false
      }
      if (filters.badgeColor) {
        const info = getBadgeInfo(getMemberTagCount(m.id))
        if (info.color !== filters.badgeColor) return false
      }
      return true
    })

    return list.sort((a, b) => {
      const diff = getMemberTagCount(b.id) - getMemberTagCount(a.id)
      if (diff !== 0) return diff
      return a.join_year - b.join_year
    })
  }, [filters])

  const active = hasAnyFilter(filters)
  const summary = buildFilterSummary(filters)

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          aria-expanded={expanded}
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            🔍{' '}
            {active ? (
              <>
                絞り込み中
                <span className="ml-1 text-[var(--color-primary)]">（{summary}）</span>
              </>
            ) : (
              '絞り込み'
            )}
          </span>
          <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">
            {expanded ? '▲' : '▼'}
          </span>
        </button>
        {expanded && (
          <div className="border-t border-gray-100 p-4">
            <MemberFilter filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      {active && (
        <p className="px-1 text-xs text-[var(--color-ink-muted)]">
          <span className="font-bold text-[var(--color-ink)]">{filtered.length}人</span> がヒット
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--color-ink-muted)]">
            該当するメンバーがいません
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(m => (
              <li key={m.id}>
                <MemberCard member={m} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
