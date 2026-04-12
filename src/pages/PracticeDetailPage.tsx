import { Link, Navigate, useParams } from 'react-router-dom'
import {
  INSTRUMENTS,
  getSongById,
  getVideosForSong,
  getDancesForSong,
  instrumentExistsForSong,
} from '@/lib/mockData'
import { VideoThumbnail } from '@/components/video/VideoThumbnail'

export default function PracticeDetailPage() {
  const { songId } = useParams<{ songId: string }>()
  const song = songId ? getSongById(songId) : undefined
  if (!song) return <Navigate to="/practice" replace />

  const videos = getVideosForSong(song.id)
  const ensemble = videos.find(v => v.video_type === 'ensemble') ?? null
  const dances = getDancesForSong(song.id)

  return (
    <div className="space-y-5">
      <Link
        to="/practice"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← 練習動画一覧に戻る
      </Link>

      <header>
        <h1 className="text-xl font-bold">{song.name}</h1>
        <p className="text-xs text-[var(--color-ink-muted)]">{song.reading}</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">🎵 合奏</h2>
        <VideoThumbnail video={ensemble} size="lg" label={`${song.name} 合奏`} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">🥁 楽器パート</h2>
        <div className="space-y-2">
          {INSTRUMENTS.filter(inst => instrumentExistsForSong(song.id, inst.id)).map(inst => {
            const v = videos.find(x => x.video_type === 'instrument' && x.instrument_id === inst.id) ?? null
            return (
              <div
                key={inst.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <VideoThumbnail video={v} size="sm" label={`${song.name} ${inst.name}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{inst.name}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{inst.alias}</p>
                </div>
                {!v && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    準備中
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {dances.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold">💃 舞パート</h2>
          <div className="space-y-2">
            {dances.map(dance => {
              const v = videos.find(x => x.video_type === 'dance' && x.dance_id === dance.id) ?? null
              return (
                <div
                  key={dance.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <VideoThumbnail video={v} size="sm" label={`${song.name} ${dance.name}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{dance.name}</p>
                  </div>
                  {!v && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      準備中
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
