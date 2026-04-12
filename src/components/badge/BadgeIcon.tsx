import { getBadgeInfo } from '@/lib/constants'

type Size = 'sm' | 'md' | 'lg'

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

const colorClass: Record<string, string> = {
  blue:    'bg-blue-500 text-white',
  yellow:  'bg-yellow-500 text-white',
  green:   'bg-green-500 text-white',
  red:     'bg-red-500 text-white',
  rainbow: 'badge-rainbow text-white',
}

export function BadgeIcon({ tagCount, size = 'md' }: { tagCount: number; size?: Size }) {
  const info = getBadgeInfo(tagCount)
  if (!info.display) {
    return (
      <span className={`inline-flex items-center rounded-full bg-gray-100 text-gray-500 ${sizeClass[size]}`}>
        未習得
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center rounded-full font-bold shadow-sm ${colorClass[info.color]} ${sizeClass[size]}`}>
      {info.grade}
    </span>
  )
}

export function getBadgeColorHex(tagCount: number): string {
  const info = getBadgeInfo(tagCount)
  switch (info.color) {
    case 'blue':    return '#3B82F6'
    case 'yellow':  return '#EAB308'
    case 'green':   return '#22C55E'
    case 'red':     return '#EF4444'
    case 'rainbow': return 'linear-gradient(135deg, #FF0000, #FF8000, #FFFF00, #00FF00, #0080FF, #8000FF)'
    default:        return '#9CA3AF'
  }
}
