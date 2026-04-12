import { getInitials } from '@/lib/constants'
import { getBadgeColorHex } from './BadgeIcon'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const sizeClass: Record<Size, string> = {
  xs: 'h-8 w-8 text-sm',
  sm: 'h-10 w-10 text-base',
  md: 'h-14 w-14 text-xl',
  lg: 'h-20 w-20 text-3xl',
  xl: 'h-24 w-24 text-4xl',
}

export function InitialAvatar({
  name,
  tagCount,
  size = 'md',
}: {
  name: string
  tagCount: number
  size?: Size
}) {
  const initial = getInitials(name)
  const bg = getBadgeColorHex(tagCount)
  const isGradient = bg.startsWith('linear-gradient')
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shadow-sm ring-2 ring-white ${sizeClass[size]}`}
      style={isGradient ? { backgroundImage: bg } : { backgroundColor: bg }}
    >
      {initial}
    </div>
  )
}
