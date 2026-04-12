import { TOTAL_TAGS } from '@/lib/constants'

export function ProgressBar({ tagCount }: { tagCount: number }) {
  const pct = Math.min(100, Math.round((tagCount / TOTAL_TAGS) * 100))
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
        <span>習得状況</span>
        <span className="font-bold">{tagCount} / {TOTAL_TAGS} タグ</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
