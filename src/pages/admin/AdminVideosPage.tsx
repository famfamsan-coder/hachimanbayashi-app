import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SONGS,
  INSTRUMENTS,
  getVideosForSong,
  getDancesForSong,
  getInstrumentById,
  getDanceById,
} from '@/lib/mockData'

function AddVideoForm({ songId, onClose }: { songId: string; onClose: () => void }) {
  const [videoType, setVideoType] = useState<'instrument' | 'dance' | 'ensemble'>('ensemble')
  const [targetId, setTargetId] = useState('')
  const [url, setUrl] = useState('')

  const dances = getDancesForSong(songId)

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="flex gap-2">
        {(['ensemble', 'instrument', 'dance'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setVideoType(t); setTargetId('') }}
            className={`rounded-full border px-3 py-1 text-xs ${
              videoType === t
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-gray-300 bg-white text-[var(--color-ink-muted)]'
            }`}
          >
            {t === 'ensemble' ? '合奏' : t === 'instrument' ? '楽器' : '舞'}
          </button>
        ))}
      </div>

      {videoType === 'instrument' && (
        <select
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="">楽器を選択</option>
          {INSTRUMENTS.map(i => (
            <option key={i.id} value={i.id}>{i.name}（{i.alias}）</option>
          ))}
        </select>
      )}
      {videoType === 'dance' && (
        <select
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="">舞を選択</option>
          {dances.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      )}

      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="YouTube URL"
        className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="text-xs text-[var(--color-ink-muted)]">
          キャンセル
        </button>
        <button
          type="button"
          onClick={() => { alert('モック: 動画を追加しました'); onClose() }}
          className="rounded bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white"
        >
          追加
        </button>
      </div>
    </div>
  )
}

export default function AdminVideosPage() {
  const [openSongId, setOpenSongId] = useState<string | null>(null)
  const [addingSongId, setAddingSongId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Link to="/profile" className="text-sm text-[var(--color-primary)] hover:underline">
        ← マイページに戻る
      </Link>

      <h1 className="text-lg font-bold">練習動画管理</h1>

      <div className="space-y-2">
        {SONGS.map(song => {
          const videos = getVideosForSong(song.id)
          const open = openSongId === song.id
          return (
            <div key={song.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpenSongId(open ? null : song.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-bold">{song.name}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{videos.length}本の動画</p>
                </div>
                <span className="text-sm text-[var(--color-ink-muted)]">{open ? '▲' : '▼'}</span>
              </button>

              {open && (
                <div className="border-t border-gray-100 px-4 py-3">
                  <ul className="space-y-1">
                    {videos.length === 0 ? (
                      <li className="text-xs text-[var(--color-ink-muted)]">動画は登録されていません</li>
                    ) : (
                      videos.map(v => {
                        const label =
                          v.video_type === 'ensemble' ? '合奏' :
                          v.video_type === 'instrument' ? getInstrumentById(v.instrument_id!)?.name ?? '' :
                          getDanceById(v.dance_id!)?.name ?? ''
                        return (
                          <li key={v.id} className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs">
                            <div className="min-w-0 flex-1">
                              <span className="font-medium">{label}</span>
                              <span className="ml-2 truncate text-[var(--color-ink-muted)]">{v.title}</span>
                            </div>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => alert('編集モック')} className="text-[var(--color-ink-muted)]">編集</button>
                              <span className="text-gray-300">|</span>
                              <button type="button" onClick={() => alert('削除モック')} className="text-red-600">削除</button>
                            </div>
                          </li>
                        )
                      })
                    )}
                  </ul>

                  {addingSongId === song.id ? (
                    <AddVideoForm songId={song.id} onClose={() => setAddingSongId(null)} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingSongId(song.id)}
                      className="mt-2 w-full rounded border border-dashed border-gray-300 py-2 text-xs text-[var(--color-ink-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      ＋ 動画を追加
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
