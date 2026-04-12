import { SONGS, INSTRUMENTS, DANCES } from '@/lib/mockData'

export type BadgeColorFilter = 'blue' | 'yellow' | 'green' | 'red' | 'rainbow'

export type MemberFilters = {
  songId: string | null
  instrumentId: string | null
  danceId: string | null
  badgeColor: BadgeColorFilter | null
}

export const EMPTY_FILTERS: MemberFilters = {
  songId: null,
  instrumentId: null,
  danceId: null,
  badgeColor: null,
}

const BADGE_COLORS: { id: BadgeColorFilter; label: string; className: string }[] = [
  { id: 'blue',    label: '入門',   className: 'bg-blue-500 text-white' },
  { id: 'yellow',  label: '修行中', className: 'bg-yellow-500 text-white' },
  { id: 'green',   label: '一人前', className: 'bg-green-500 text-white' },
  { id: 'red',     label: '達人',   className: 'bg-red-500 text-white' },
  { id: 'rainbow', label: '名人',   className: 'badge-rainbow text-white' },
]

const BADGE_LABEL: Record<BadgeColorFilter, string> = {
  blue: '入門', yellow: '修行中', green: '一人前', red: '達人', rainbow: '名人',
}

export function hasAnyFilter(f: MemberFilters): boolean {
  return !!(f.songId || f.instrumentId || f.danceId || f.badgeColor)
}

export function buildFilterSummary(f: MemberFilters): string {
  const parts: string[] = []
  if (f.songId) {
    const s = SONGS.find(x => x.id === f.songId)
    if (s) parts.push(s.name)
  }
  if (f.instrumentId) {
    const i = INSTRUMENTS.find(x => x.id === f.instrumentId)
    if (i) parts.push(i.alias)
  }
  if (f.danceId) {
    const d = DANCES.find(x => x.id === f.danceId)
    if (d) parts.push(d.name)
  }
  if (f.badgeColor) parts.push(BADGE_LABEL[f.badgeColor])
  return parts.join(' × ')
}

function Chip({
  active,
  onClick,
  children,
  activeClass = 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]',
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  activeClass?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? activeClass
          : 'border-gray-300 bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-primary)]/50'
      }`}
    >
      {children}
    </button>
  )
}

export function MemberFilter({
  filters,
  onChange,
}: {
  filters: MemberFilters
  onChange: (next: MemberFilters) => void
}) {
  const set = <K extends keyof MemberFilters>(key: K, value: MemberFilters[K]) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">曲</p>
        <div className="flex flex-wrap gap-1.5">
          {SONGS.map(s => (
            <Chip key={s.id} active={filters.songId === s.id} onClick={() => set('songId', s.id)}>
              {s.name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">楽器</p>
        <div className="flex flex-wrap gap-1.5">
          {INSTRUMENTS.map(i => (
            <Chip
              key={i.id}
              active={filters.instrumentId === i.id}
              onClick={() => set('instrumentId', i.id)}
            >
              {i.name}（{i.alias}）
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">舞</p>
        <div className="flex flex-wrap gap-1.5">
          {DANCES.map(d => (
            <Chip key={d.id} active={filters.danceId === d.id} onClick={() => set('danceId', d.id)}>
              {d.name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-[var(--color-ink-muted)]">バッジ</p>
        <div className="flex flex-wrap gap-1.5">
          {BADGE_COLORS.map(b => (
            <Chip
              key={b.id}
              active={filters.badgeColor === b.id}
              onClick={() => set('badgeColor', b.id)}
              activeClass={`${b.className} border-transparent`}
            >
              {b.label}
            </Chip>
          ))}
        </div>
      </div>

      {hasAnyFilter(filters) && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            クリア
          </button>
        </div>
      )}
    </div>
  )
}
