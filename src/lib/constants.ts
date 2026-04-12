export const TOTAL_TAGS = 37

export type BadgeInfo = {
  grade: string
  color: 'blue' | 'yellow' | 'green' | 'red' | 'rainbow' | 'none'
  display: boolean
}

export function getBadgeInfo(tagCount: number): BadgeInfo {
  if (tagCount <= 0)  return { grade: '', color: 'none', display: false }
  if (tagCount <= 7)  return { grade: '入門',   color: 'blue',    display: true }
  if (tagCount <= 15) return { grade: '修行中', color: 'yellow',  display: true }
  if (tagCount <= 23) return { grade: '一人前', color: 'green',   display: true }
  if (tagCount <= 33) return { grade: '達人',   color: 'red',     display: true }
  return { grade: '名人', color: 'rainbow', display: true }
}

export function getInitials(displayName: string): string {
  const trimmed = displayName.trim()
  if (!trimmed) return '？'
  return Array.from(trimmed)[0] ?? '？'
}

// ============================================================
// 特別バッジ（称号）
// ============================================================

export type MemberSkillSet = {
  // "songId::instrumentId" のセット
  instruments: Set<string>
  // "songId::danceId" のセット
  dances: Set<string>
  totalTags: number
}

export type SpecialBadge = {
  id: string
  name: string
  icon: string
  description: string
  condition: (s: MemberSkillSet) => boolean
}

const ALL_SONGS = ['ninba', 'yatai', 'kuniga', 'shichou', 'kamakura', 'shouden']
const NON_NINBA_SONGS = ['yatai', 'kuniga', 'shichou', 'kamakura', 'shouden']

const hasAllInst = (songs: string[], instId: string) =>
  (s: MemberSkillSet) => songs.every(sid => s.instruments.has(`${sid}::${instId}`))

const hasAllSongPositions = (songId: string, instIds: string[], danceIds: string[]) =>
  (s: MemberSkillSet) =>
    instIds.every(i => s.instruments.has(`${songId}::${i}`)) &&
    danceIds.every(d => s.dances.has(`${songId}::${d}`))

export const SPECIAL_BADGES: SpecialBadge[] = [
  // === 楽器マスター系 ===
  { id: 'master-ookan',  name: '大太鼓の達人',         icon: '🥁', description: '全6曲の大太鼓（おおかん）を習得', condition: hasAllInst(ALL_SONGS, 'ookan') },
  { id: 'master-tsuke',  name: '小太鼓（つけ）の達人', icon: '🪘', description: '全6曲の小太鼓（つけ）を習得',     condition: hasAllInst(ALL_SONGS, 'tsuke') },
  { id: 'master-karami', name: '小太鼓（からみ）の達人', icon: '🎶', description: '対象5曲の小太鼓（からみ）を習得', condition: hasAllInst(NON_NINBA_SONGS, 'karami') },
  { id: 'master-kane',   name: '鉦の達人',             icon: '🔔', description: '全6曲の鉦（かね）を習得',         condition: hasAllInst(ALL_SONGS, 'kane') },
  { id: 'master-fue',    name: '笛の達人',             icon: '🎵', description: '全6曲の笛（ふえ）を習得',         condition: hasAllInst(ALL_SONGS, 'fue') },

  // === 舞マスター系 ===
  {
    id: 'master-shishimai',
    name: '獅子舞マスター',
    icon: '🦁',
    description: '獅子舞が紐づく全3曲（屋台ばやし・鎌倉・昇殿）の獅子舞を習得',
    condition: s =>
      s.dances.has('yatai::shishimai') &&
      s.dances.has('kamakura::shishimai') &&
      s.dances.has('shouden::shishimai'),
  },

  // === 曲コンプリート系 ===
  {
    id: 'complete-ninba',
    name: 'にんば師範',
    icon: '📜',
    description: 'にんばの全ポジション（楽器4＋舞2＝6個）を習得',
    condition: hasAllSongPositions('ninba', ['ookan', 'tsuke', 'kane', 'fue'], ['hyottoko', 'okame']),
  },
  {
    id: 'complete-yatai',
    name: '屋台ばやし師範',
    icon: '📜',
    description: '屋台ばやしの全ポジション（楽器5＋舞2＝7個）を習得',
    condition: hasAllSongPositions('yatai', ['ookan', 'tsuke', 'karami', 'kane', 'fue'], ['shishimai', 'kitsune']),
  },
  {
    id: 'complete-kuniga',
    name: '国がため師範',
    icon: '📜',
    description: '国がための全ポジション（楽器5＋舞1＝6個）を習得',
    condition: hasAllSongPositions('kuniga', ['ookan', 'tsuke', 'karami', 'kane', 'fue'], ['tanuki']),
  },
  {
    id: 'complete-shichou',
    name: '四丁目師範',
    icon: '📜',
    description: '四丁目の全ポジション（楽器5＋舞1＝6個）を習得',
    condition: hasAllSongPositions('shichou', ['ookan', 'tsuke', 'karami', 'kane', 'fue'], ['gedou']),
  },
  {
    id: 'complete-kamakura',
    name: '鎌倉師範',
    icon: '📜',
    description: '鎌倉の全ポジション（楽器5＋舞1＝6個）を習得',
    condition: hasAllSongPositions('kamakura', ['ookan', 'tsuke', 'karami', 'kane', 'fue'], ['shishimai']),
  },
  {
    id: 'complete-shouden',
    name: '昇殿師範',
    icon: '📜',
    description: '昇殿の全ポジション（楽器5＋舞1＝6個）を習得',
    condition: hasAllSongPositions('shouden', ['ookan', 'tsuke', 'karami', 'kane', 'fue'], ['shishimai']),
  },

  // === 特別称号 ===
  {
    id: 'all-rounder',
    name: '万能囃子方',
    icon: '🌟',
    description: '楽器スキルと舞スキルの両方を10個以上ずつ習得',
    condition: s => s.instruments.size >= 10 && s.dances.size >= 10,
  },
  {
    id: 'grand-master',
    name: '八幡ばやし大名人',
    icon: '👑',
    description: '全37タグを習得（完全制覇）',
    condition: s => s.totalTags >= TOTAL_TAGS,
  },
]

export function buildMemberSkillSet(
  instSkills: { song_id: string; instrument_id: string }[],
  danceSkills: { song_id: string; dance_id: string }[],
): MemberSkillSet {
  return {
    instruments: new Set(instSkills.map(s => `${s.song_id}::${s.instrument_id}`)),
    dances: new Set(danceSkills.map(s => `${s.song_id}::${s.dance_id}`)),
    totalTags: instSkills.length + danceSkills.length,
  }
}

export function getEarnedBadges(skillSet: MemberSkillSet): SpecialBadge[] {
  return SPECIAL_BADGES.filter(b => b.condition(skillSet))
}
