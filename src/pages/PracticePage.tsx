import { Link } from 'react-router-dom'
import { SONGS, getVideosForSong, getDancesForSong } from '@/lib/mockData'

export default function PracticePage() {
  return (
    <div className="space-y-3">
      <h2 className="px-1 text-sm font-bold text-[var(--color-ink-muted)]">🎵 練習動画</h2>
      {SONGS.map(song => {
        const videos = getVideosForSong(song.id)
        const dances = getDancesForSong(song.id)
        const isEmpty = videos.length === 0
        return (
          <Link
            key={song.id}
            to={`/practice/${song.id}`}
            className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[var(--color-primary)]/50 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold">{song.name}</h3>
                <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                  {dances.length > 0 ? `舞: ${dances.map(d => d.name).join('・')}` : '舞なし'}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {isEmpty ? (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                    準備中
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                    {videos.length}本
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
