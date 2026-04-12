export type Role = 'member' | 'admin'

export type Profile = {
  id: string
  display_name: string
  furigana: string | null
  role: Role
  join_year: number | null
  bio: string | null
  avatar_url: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type Song = {
  id: string
  name: string
  reading: string
  sort_order: number
}

export type Instrument = {
  id: string
  name: string
  alias: string
  player_count: number
  sort_order: number
}

export type Dance = {
  id: string
  name: string
  sort_order: number
}

export type BadgeThreshold = {
  id: number
  grade_name: string
  color: 'blue' | 'yellow' | 'green' | 'red' | 'rainbow'
  min_tags: number
  max_tags: number
  sort_order: number
}

export type AttendanceStatus = 'attend' | 'absent' | 'pending'
