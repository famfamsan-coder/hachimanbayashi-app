import type { PracticeVideo } from '@/lib/mockData'

type Size = 'sm' | 'lg'

export function VideoThumbnail({
  video,
  size = 'sm',
  label,
}: {
  video: PracticeVideo | null
  size?: Size
  label: string
}) {
  const isLarge = size === 'lg'
  const box = isLarge ? 'aspect-video w-full' : 'h-16 w-24 shrink-0'

  if (!video) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 ${box}`}>
        準備中
      </div>
    )
  }

  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noreferrer noopener"
      className={`group relative flex items-center justify-center overflow-hidden rounded-lg bg-black text-white transition hover:opacity-90 ${box}`}
      aria-label={`${label}を YouTube で開く`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black" />
      <div className="relative z-10 flex items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] shadow-md group-hover:scale-110 transition"
           style={{ width: isLarge ? 56 : 32, height: isLarge ? 56 : 32 }}>
        <span className="ml-1 text-xl">▶</span>
      </div>
    </a>
  )
}
