import type { Profile, Song, Instrument, Dance, AttendanceStatus } from '@/types/database'

// ============================================================
// ログイン中ユーザー（切り替えはここで）
// ============================================================
// 'user-001' = 高橋 正男（admin）  管理者モードの確認に使用
// 'user-002' = 佐藤 健一（member） 一般会員モードの確認に使用
export const CURRENT_USER_ID = 'user-001'

// ============================================================
// マスタデータ
// ============================================================

export const SONGS: Song[] = [
  { id: 'ninba',    name: 'にんば',     reading: 'にんば',       sort_order: 1 },
  { id: 'yatai',    name: '屋台ばやし', reading: 'やたいばやし', sort_order: 2 },
  { id: 'kuniga',   name: '国がため',   reading: 'くにがため',   sort_order: 3 },
  { id: 'shichou',  name: '四丁目',     reading: 'しちょうめ',   sort_order: 4 },
  { id: 'kamakura', name: '鎌倉',       reading: 'かまくら',     sort_order: 5 },
  { id: 'shouden',  name: '昇殿',       reading: 'しょうでん',   sort_order: 6 },
]

export const INSTRUMENTS: Instrument[] = [
  { id: 'ookan',  name: '大太鼓', alias: 'おおかん', player_count: 1, sort_order: 1 },
  { id: 'tsuke',  name: '小太鼓', alias: 'つけ',     player_count: 2, sort_order: 2 },
  { id: 'karami', name: '小太鼓', alias: 'からみ',   player_count: 1, sort_order: 3 },
  { id: 'kane',   name: '鉦',     alias: 'かね',     player_count: 1, sort_order: 4 },
  { id: 'fue',    name: '笛',     alias: 'ふえ',     player_count: 1, sort_order: 5 },
]

// にんばには「からみ」がないので除外する
const NO_KARAMI_SONG = 'ninba'
export function instrumentExistsForSong(songId: string, instrumentId: string): boolean {
  if (songId === NO_KARAMI_SONG && instrumentId === 'karami') return false
  return true
}

export const DANCES: Dance[] = [
  { id: 'hyottoko',  name: 'ひょっとこ', sort_order: 1 },
  { id: 'okame',     name: 'おかめ',     sort_order: 2 },
  { id: 'kitsune',   name: 'きつね',     sort_order: 3 },
  { id: 'tanuki',    name: 'たぬき',     sort_order: 4 },
  { id: 'shishimai', name: '獅子舞',     sort_order: 5 },
  { id: 'gedou',     name: '外道',       sort_order: 6 },
]

export const SONG_DANCES: { song_id: string; dance_id: string }[] = [
  { song_id: 'ninba',    dance_id: 'hyottoko' },
  { song_id: 'ninba',    dance_id: 'okame' },
  { song_id: 'yatai',    dance_id: 'shishimai' },
  { song_id: 'yatai',    dance_id: 'kitsune' },
  { song_id: 'kuniga',   dance_id: 'tanuki' },
  { song_id: 'shichou',  dance_id: 'gedou' },
  { song_id: 'kamakura', dance_id: 'shishimai' },
  { song_id: 'shouden',  dance_id: 'shishimai' },
]

// ============================================================
// 会員データ
// ============================================================

const now = '2026-01-01T00:00:00Z'

export const MEMBERS: Profile[] = [
  {
    id: 'user-001', display_name: '高橋 正男', furigana: 'たかはし まさお',
    role: 'admin',  join_year: 1995, bio: '保存会の会長を務めています。',
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-002', display_name: '佐藤 健一', furigana: 'さとう けんいち',
    role: 'member', join_year: 2019, bio: '笛を中心に練習中です。',
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-003', display_name: '山本 美咲', furigana: 'やまもと みさき',
    role: 'member', join_year: 2015, bio: null,
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-004', display_name: '田中 太郎', furigana: 'たなか たろう',
    role: 'member', join_year: 2022, bio: '子供と一緒に参加しています。',
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-005', display_name: '鈴木 花子', furigana: 'すずき はなこ',
    role: 'member', join_year: 2020, bio: null,
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-006', display_name: '伊藤 和也', furigana: 'いとう かずや',
    role: 'member', join_year: 2018, bio: '大太鼓が得意です。',
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-007', display_name: '中村 大輔', furigana: 'なかむら だいすけ',
    role: 'member', join_year: 2023, bio: null,
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
  {
    id: 'user-008', display_name: '小林 真由美', furigana: 'こばやし まゆみ',
    role: 'member', join_year: 2021, bio: '獅子舞の練習を頑張っています。',
    avatar_url: null, deleted_at: null, created_at: now, updated_at: now,
  },
]

// ============================================================
// スキルデータ
// ============================================================

export type InstrumentSkill = {
  id: string
  member_id: string
  song_id: string
  instrument_id: string
  granted_at: string
}

export type DanceSkill = {
  id: string
  member_id: string
  song_id: string
  dance_id: string
  granted_at: string
}

const mkIs = (member: string, song: string, inst: string): InstrumentSkill => ({
  id: `is-${member}-${song}-${inst}`,
  member_id: member, song_id: song, instrument_id: inst,
  granted_at: '2025-06-01T00:00:00Z',
})
const mkDs = (member: string, song: string, dance: string): DanceSkill => ({
  id: `ds-${member}-${song}-${dance}`,
  member_id: member, song_id: song, dance_id: dance,
  granted_at: '2025-06-01T00:00:00Z',
})

// user-001: 全タグ（29楽器 + 8舞 = 37）※にんば×からみは存在しないので除外
const user001Inst = SONGS.flatMap(s =>
  INSTRUMENTS
    .filter(i => instrumentExistsForSong(s.id, i.id))
    .map(i => mkIs('user-001', s.id, i.id)),
)
const user001Dance = SONG_DANCES.map(sd => mkDs('user-001', sd.song_id, sd.dance_id))

export const MOCK_INSTRUMENT_SKILLS: InstrumentSkill[] = [
  ...user001Inst,

  // user-002: 15 楽器
  mkIs('user-002', 'ninba',    'ookan'),
  mkIs('user-002', 'ninba',    'tsuke'),
  mkIs('user-002', 'ninba',    'fue'),
  mkIs('user-002', 'yatai',    'ookan'),
  mkIs('user-002', 'yatai',    'tsuke'),
  mkIs('user-002', 'yatai',    'karami'),
  mkIs('user-002', 'kuniga',   'kane'),
  mkIs('user-002', 'kuniga',   'karami'),
  mkIs('user-002', 'shichou',  'ookan'),
  mkIs('user-002', 'shichou',  'fue'),
  mkIs('user-002', 'kamakura', 'tsuke'),
  mkIs('user-002', 'kamakura', 'kane'),
  mkIs('user-002', 'kamakura', 'karami'),
  mkIs('user-002', 'shouden',  'ookan'),
  mkIs('user-002', 'shouden',  'fue'),

  // user-003: 23 楽器
  mkIs('user-003', 'ninba',    'ookan'),
  mkIs('user-003', 'ninba',    'tsuke'),
  mkIs('user-003', 'ninba',    'kane'),
  mkIs('user-003', 'ninba',    'fue'),
  mkIs('user-003', 'yatai',    'ookan'),
  mkIs('user-003', 'yatai',    'tsuke'),
  mkIs('user-003', 'yatai',    'karami'),
  mkIs('user-003', 'yatai',    'kane'),
  mkIs('user-003', 'yatai',    'fue'),
  mkIs('user-003', 'kuniga',   'ookan'),
  mkIs('user-003', 'kuniga',   'tsuke'),
  mkIs('user-003', 'kuniga',   'karami'),
  mkIs('user-003', 'kuniga',   'kane'),
  mkIs('user-003', 'kuniga',   'fue'),
  mkIs('user-003', 'shichou',  'ookan'),
  mkIs('user-003', 'shichou',  'tsuke'),
  mkIs('user-003', 'shichou',  'karami'),
  mkIs('user-003', 'kamakura', 'ookan'),
  mkIs('user-003', 'kamakura', 'tsuke'),
  mkIs('user-003', 'kamakura', 'karami'),
  mkIs('user-003', 'shouden',  'ookan'),
  mkIs('user-003', 'shouden',  'kane'),
  mkIs('user-003', 'shouden',  'karami'),

  // user-004: 2 楽器（最近にんば×鉦を習得）
  mkIs('user-004', 'ninba', 'tsuke'),
  mkIs('user-004', 'ninba', 'kane'),

  // user-005: 6 楽器（全曲×笛）
  ...SONGS.map(s => mkIs('user-005', s.id, 'fue')),

  // user-006: 8 楽器（全曲×大太鼓 + 屋台ばやし×からみ + 鎌倉×からみ）
  ...SONGS.map(s => mkIs('user-006', s.id, 'ookan')),
  mkIs('user-006', 'yatai',    'karami'),
  mkIs('user-006', 'kamakura', 'karami'),

  // user-007: 1 楽器
  mkIs('user-007', 'ninba', 'tsuke'),

  // user-008: 3 楽器
  mkIs('user-008', 'ninba',  'kane'),
  mkIs('user-008', 'yatai',  'kane'),
  mkIs('user-008', 'kuniga', 'kane'),
]

export const MOCK_DANCE_SKILLS: DanceSkill[] = [
  ...user001Dance,

  // user-002: 4 舞
  mkDs('user-002', 'ninba',  'hyottoko'),
  mkDs('user-002', 'ninba',  'okame'),
  mkDs('user-002', 'yatai',  'shishimai'),
  mkDs('user-002', 'kuniga', 'tanuki'),

  // user-003: 7 舞
  mkDs('user-003', 'ninba',    'hyottoko'),
  mkDs('user-003', 'ninba',    'okame'),
  mkDs('user-003', 'yatai',    'shishimai'),
  mkDs('user-003', 'yatai',    'kitsune'),
  mkDs('user-003', 'kuniga',   'tanuki'),
  mkDs('user-003', 'shichou',  'gedou'),
  mkDs('user-003', 'kamakura', 'shishimai'),

  // user-004: 0 舞

  // user-005: 2 舞
  mkDs('user-005', 'ninba', 'okame'),
  mkDs('user-005', 'yatai', 'kitsune'),

  // user-006: 4 舞
  mkDs('user-006', 'ninba',    'hyottoko'),
  mkDs('user-006', 'yatai',    'shishimai'),
  mkDs('user-006', 'kamakura', 'shishimai'),
  mkDs('user-006', 'shouden',  'shishimai'),

  // user-007: 1 舞
  mkDs('user-007', 'ninba', 'hyottoko'),

  // user-008: 2 舞
  mkDs('user-008', 'yatai',   'shishimai'),
  mkDs('user-008', 'shouden', 'shishimai'),
]

// ============================================================
// お知らせ
// ============================================================

export type Announcement = {
  id: string
  title: string
  body: string
  type: 'general' | 'skill_achievement' | 'event'
  related_member_id?: string | null
  related_skill_description?: string | null
  is_pinned: boolean
  expires_at: string | null
  created_at: string
}

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: '🎉 おめでとうございます！',
    body: '田中 太郎さんが「にんば × 鉦（かね）」を習得しました！',
    type: 'skill_achievement',
    related_member_id: 'user-004',
    related_skill_description: 'にんば × 鉦（かね）',
    is_pinned: false,
    expires_at: '2026-04-26T00:00:00Z',
    created_at: '2026-04-12T10:00:00Z',
  },
  {
    id: 'ann-002',
    title: '🎉 おめでとうございます！',
    body: '鈴木 花子さんが「屋台ばやし × きつね」を習得しました！',
    type: 'skill_achievement',
    related_member_id: 'user-005',
    related_skill_description: '屋台ばやし × きつね',
    is_pinned: false,
    expires_at: '2026-04-24T00:00:00Z',
    created_at: '2026-04-10T10:00:00Z',
  },
  {
    id: 'ann-003',
    title: '📅 春季合同練習会',
    body: '4月20日（日）に春季合同練習会を開催します。全曲通し練習を行いますので、楽器・衣装をお持ちください。',
    type: 'general',
    is_pinned: true,
    expires_at: null,
    created_at: '2026-04-05T10:00:00Z',
  },
  {
    id: 'ann-004',
    title: '📢 5月の練習日程について',
    body: '5月の練習は毎週土曜日19:00〜21:00、日の出町公民館2Fで行います。初回は5月3日です。',
    type: 'general',
    is_pinned: false,
    expires_at: null,
    created_at: '2026-04-01T10:00:00Z',
  },
]

// ============================================================
// イベント & 出欠
// ============================================================

export type EventItem = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  location: string | null
  created_at: string
}

export type EventResponse = {
  event_id: string
  member_id: string
  status: AttendanceStatus
  comment: string | null
}

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt-001',
    title: '春季合同練習会',
    description: '全曲通し練習を行います。楽器・衣装をお持ちください。',
    event_date: '2026-04-20',
    event_time: '14:00〜16:00',
    location: '日の出町公民館 2F 大ホール',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'evt-002',
    title: '日の出町夏祭り本番',
    description: '本番です。13:00に神社境内に集合。衣装一式を忘れずに。',
    event_date: '2026-07-20',
    event_time: '15:00〜20:00',
    location: '八幡神社 境内',
    created_at: '2026-04-10T10:00:00Z',
  },
]

export const MOCK_EVENT_RESPONSES: EventResponse[] = [
  { event_id: 'evt-001', member_id: 'user-001', status: 'attend',  comment: null },
  { event_id: 'evt-001', member_id: 'user-002', status: 'attend',  comment: '楽しみです！' },
  { event_id: 'evt-001', member_id: 'user-003', status: 'attend',  comment: null },
  { event_id: 'evt-001', member_id: 'user-004', status: 'absent',  comment: '家族の予定があります' },
  { event_id: 'evt-001', member_id: 'user-005', status: 'attend',  comment: null },
  { event_id: 'evt-001', member_id: 'user-006', status: 'pending', comment: '仕事次第です' },
  { event_id: 'evt-001', member_id: 'user-007', status: 'pending', comment: null },
  // user-008 未回答

  { event_id: 'evt-002', member_id: 'user-001', status: 'attend', comment: null },
  { event_id: 'evt-002', member_id: 'user-003', status: 'attend', comment: null },
]

// ============================================================
// 練習動画
// ============================================================

export type PracticeVideo = {
  id: string
  song_id: string
  video_type: 'instrument' | 'dance' | 'ensemble'
  instrument_id: string | null
  dance_id: string | null
  youtube_url: string
  title: string | null
  description: string | null
  sort_order: number
}

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

export const MOCK_VIDEOS: PracticeVideo[] = [
  // にんば
  { id: 'vid-001', song_id: 'ninba', video_type: 'ensemble',   instrument_id: null,    dance_id: null,       youtube_url: YT, title: 'にんば 合奏',                    description: '全体合わせの練習動画', sort_order: 0 },
  { id: 'vid-002', song_id: 'ninba', video_type: 'instrument', instrument_id: 'ookan', dance_id: null,       youtube_url: YT, title: 'にんば 大太鼓（おおかん）パート', description: null, sort_order: 1 },
  { id: 'vid-003', song_id: 'ninba', video_type: 'instrument', instrument_id: 'tsuke', dance_id: null,       youtube_url: YT, title: 'にんば 小太鼓（つけ）パート',       description: null, sort_order: 2 },
  { id: 'vid-004', song_id: 'ninba', video_type: 'instrument', instrument_id: 'kane',  dance_id: null,       youtube_url: YT, title: 'にんば 鉦（かね）パート',         description: null, sort_order: 3 },
  { id: 'vid-005', song_id: 'ninba', video_type: 'instrument', instrument_id: 'fue',   dance_id: null,       youtube_url: YT, title: 'にんば 笛（ふえ）パート',         description: null, sort_order: 4 },
  { id: 'vid-006', song_id: 'ninba', video_type: 'dance',      instrument_id: null,    dance_id: 'hyottoko', youtube_url: YT, title: 'にんば ひょっとこ',               description: null, sort_order: 5 },
  { id: 'vid-007', song_id: 'ninba', video_type: 'dance',      instrument_id: null,    dance_id: 'okame',    youtube_url: YT, title: 'にんば おかめ',                   description: null, sort_order: 6 },

  // 屋台ばやし
  { id: 'vid-008', song_id: 'yatai', video_type: 'ensemble',   instrument_id: null,    dance_id: null,        youtube_url: YT, title: '屋台ばやし 合奏',                    description: null, sort_order: 0 },
  { id: 'vid-009', song_id: 'yatai', video_type: 'instrument', instrument_id: 'ookan', dance_id: null,        youtube_url: YT, title: '屋台ばやし 大太鼓（おおかん）パート', description: null, sort_order: 1 },
  { id: 'vid-010', song_id: 'yatai', video_type: 'instrument', instrument_id: 'fue',   dance_id: null,        youtube_url: YT, title: '屋台ばやし 笛（ふえ）パート',         description: null, sort_order: 2 },
  { id: 'vid-011', song_id: 'yatai', video_type: 'dance',      instrument_id: null,    dance_id: 'shishimai', youtube_url: YT, title: '屋台ばやし 獅子舞',                   description: null, sort_order: 3 },
  { id: 'vid-012', song_id: 'yatai', video_type: 'dance',      instrument_id: null,    dance_id: 'kitsune',   youtube_url: YT, title: '屋台ばやし きつね',                   description: null, sort_order: 4 },
]

// ============================================================
// ヘルパー関数
// ============================================================

export function getMemberById(id: string): Profile | undefined {
  return MEMBERS.find(m => m.id === id)
}

export function getVisibleMembers(): Profile[] {
  return MEMBERS.filter(m => !m.deleted_at)
}

export function getCurrentUser(): Profile | undefined {
  return getMemberById(CURRENT_USER_ID)
}

export function getSongById(id: string): Song | undefined {
  return SONGS.find(s => s.id === id)
}
export function getInstrumentById(id: string): Instrument | undefined {
  return INSTRUMENTS.find(i => i.id === id)
}
export function getDanceById(id: string): Dance | undefined {
  return DANCES.find(d => d.id === id)
}
export function getDancesForSong(songId: string): Dance[] {
  const ids = SONG_DANCES.filter(sd => sd.song_id === songId).map(sd => sd.dance_id)
  return DANCES.filter(d => ids.includes(d.id))
}

export function getMemberInstrumentSkills(memberId: string): InstrumentSkill[] {
  return MOCK_INSTRUMENT_SKILLS.filter(s => s.member_id === memberId)
}
export function getMemberDanceSkills(memberId: string): DanceSkill[] {
  return MOCK_DANCE_SKILLS.filter(s => s.member_id === memberId)
}
export function getMemberTagCount(memberId: string): number {
  return (
    getMemberInstrumentSkills(memberId).length +
    getMemberDanceSkills(memberId).length
  )
}

export function getVideosForSong(songId: string): PracticeVideo[] {
  return MOCK_VIDEOS.filter(v => v.song_id === songId).sort((a, b) => a.sort_order - b.sort_order)
}

export function getEventResponses(eventId: string): EventResponse[] {
  return MOCK_EVENT_RESPONSES.filter(r => r.event_id === eventId)
}
export function getMemberResponse(eventId: string, memberId: string): EventResponse | undefined {
  return MOCK_EVENT_RESPONSES.find(r => r.event_id === eventId && r.member_id === memberId)
}

// ============================================================
// 編成シミュレーター
// ============================================================

export type FormationAssignment = {
  program_id: string
  position_type: 'instrument' | 'dance'
  position_id: string
  member_id: string | null
}

export type FormationProgram = {
  id: string
  formation_id: string
  song_id: string
  program_order: number
  assignments: FormationAssignment[]
}

export type Formation = {
  id: string
  title: string
  event_id: string | null
  created_at: string
  updated_at: string
  programs: FormationProgram[]
}

export const MOCK_FORMATIONS: Formation[] = [
  {
    id: 'form-001',
    title: '令和8年 日の出町夏祭り',
    event_id: 'evt-002',
    created_at: '2026-04-10T10:00:00Z',
    updated_at: '2026-04-12T10:00:00Z',
    programs: [
      {
        id: 'prog-001',
        formation_id: 'form-001',
        song_id: 'ninba',
        program_order: 1,
        assignments: [
          { program_id: 'prog-001', position_type: 'instrument', position_id: 'ookan', member_id: 'user-006' },
          { program_id: 'prog-001', position_type: 'instrument', position_id: 'tsuke', member_id: 'user-002' },
          { program_id: 'prog-001', position_type: 'instrument', position_id: 'kane',  member_id: 'user-008' },
          { program_id: 'prog-001', position_type: 'instrument', position_id: 'fue',   member_id: 'user-005' },
          { program_id: 'prog-001', position_type: 'dance',      position_id: 'hyottoko', member_id: 'user-007' },
          { program_id: 'prog-001', position_type: 'dance',      position_id: 'okame',    member_id: 'user-003' },
        ],
      },
      {
        id: 'prog-002',
        formation_id: 'form-001',
        song_id: 'yatai',
        program_order: 2,
        assignments: [
          { program_id: 'prog-002', position_type: 'instrument', position_id: 'ookan',  member_id: 'user-001' },
          { program_id: 'prog-002', position_type: 'instrument', position_id: 'tsuke',  member_id: 'user-002' },
          { program_id: 'prog-002', position_type: 'instrument', position_id: 'karami', member_id: 'user-003' },
          { program_id: 'prog-002', position_type: 'instrument', position_id: 'kane',   member_id: 'user-008' },
          { program_id: 'prog-002', position_type: 'instrument', position_id: 'fue',    member_id: 'user-005' },
          { program_id: 'prog-002', position_type: 'dance',      position_id: 'shishimai', member_id: 'user-006' },
          { program_id: 'prog-002', position_type: 'dance',      position_id: 'kitsune',   member_id: 'user-004' },
        ],
      },
    ],
  },
]

export function getFormationById(id: string): Formation | undefined {
  return MOCK_FORMATIONS.find(f => f.id === id)
}
export function getFormationsForEvent(eventId: string): Formation[] {
  return MOCK_FORMATIONS.filter(f => f.event_id === eventId)
}

// ポジションに配置可能な会員を返す（該当スキル保有者のみ）
export function getEligibleMembersForPosition(
  songId: string,
  positionType: 'instrument' | 'dance',
  positionId: string,
): Profile[] {
  if (positionType === 'instrument') {
    const memberIds = MOCK_INSTRUMENT_SKILLS
      .filter(s => s.song_id === songId && s.instrument_id === positionId)
      .map(s => s.member_id)
    return getVisibleMembers().filter(m => memberIds.includes(m.id))
  }
  const memberIds = MOCK_DANCE_SKILLS
    .filter(s => s.song_id === songId && s.dance_id === positionId)
    .map(s => s.member_id)
  return getVisibleMembers().filter(m => memberIds.includes(m.id))
}

// 曲に対する全ポジション（楽器＋舞）を順序通り返す
export type Position = {
  type: 'instrument' | 'dance'
  id: string
  label: string // 表示名
}
export function getPositionsForSong(songId: string): Position[] {
  const insts: Position[] = INSTRUMENTS
    .filter(i => instrumentExistsForSong(songId, i.id))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(i => ({ type: 'instrument', id: i.id, label: `${i.name}（${i.alias}）` }))
  const dances: Position[] = getDancesForSong(songId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(d => ({ type: 'dance', id: d.id, label: d.name }))
  return [...insts, ...dances]
}

// ============================================================
// 練習出席カレンダー
// ============================================================

export type PracticeSession = {
  id: string
  date: string
  title: string
  location: string | null
  note: string | null
  created_at: string
}

export type PracticeAttendance = {
  session_id: string
  member_id: string
  attended: boolean
}

export const MOCK_PRACTICE_SESSIONS: PracticeSession[] = [
  { id: 'ps-001', date: '2026-03-01', title: '定例練習', location: '日の出町公民館', note: null, created_at: '2026-03-01T10:00:00Z' },
  { id: 'ps-002', date: '2026-03-08', title: '定例練習', location: '日の出町公民館', note: null, created_at: '2026-03-08T10:00:00Z' },
  { id: 'ps-003', date: '2026-03-15', title: '定例練習', location: '日の出町公民館', note: null, created_at: '2026-03-15T10:00:00Z' },
  { id: 'ps-004', date: '2026-03-22', title: '特別練習（夏祭り準備）', location: '八幡神社 社務所', note: '衣装合わせあり', created_at: '2026-03-22T10:00:00Z' },
  { id: 'ps-005', date: '2026-03-29', title: '定例練習', location: '日の出町公民館', note: null, created_at: '2026-03-29T10:00:00Z' },
  { id: 'ps-006', date: '2026-04-05', title: '定例練習', location: '日の出町公民館', note: null, created_at: '2026-04-05T10:00:00Z' },
]

export const MOCK_PRACTICE_ATTENDANCE: PracticeAttendance[] = [
  // user-001 高橋 皆勤
  { session_id: 'ps-001', member_id: 'user-001', attended: true },
  { session_id: 'ps-002', member_id: 'user-001', attended: true },
  { session_id: 'ps-003', member_id: 'user-001', attended: true },
  { session_id: 'ps-004', member_id: 'user-001', attended: true },
  { session_id: 'ps-005', member_id: 'user-001', attended: true },
  { session_id: 'ps-006', member_id: 'user-001', attended: true },

  // user-002 佐藤 4/6
  { session_id: 'ps-001', member_id: 'user-002', attended: true },
  { session_id: 'ps-002', member_id: 'user-002', attended: false },
  { session_id: 'ps-003', member_id: 'user-002', attended: true },
  { session_id: 'ps-004', member_id: 'user-002', attended: true },
  { session_id: 'ps-005', member_id: 'user-002', attended: false },
  { session_id: 'ps-006', member_id: 'user-002', attended: true },

  // user-003 山本 5/6
  { session_id: 'ps-001', member_id: 'user-003', attended: true },
  { session_id: 'ps-002', member_id: 'user-003', attended: true },
  { session_id: 'ps-003', member_id: 'user-003', attended: true },
  { session_id: 'ps-004', member_id: 'user-003', attended: false },
  { session_id: 'ps-005', member_id: 'user-003', attended: true },
  { session_id: 'ps-006', member_id: 'user-003', attended: true },

  // user-004 田中 1/6
  { session_id: 'ps-001', member_id: 'user-004', attended: false },
  { session_id: 'ps-002', member_id: 'user-004', attended: true },
  { session_id: 'ps-003', member_id: 'user-004', attended: false },
  { session_id: 'ps-004', member_id: 'user-004', attended: false },
  { session_id: 'ps-005', member_id: 'user-004', attended: false },
  { session_id: 'ps-006', member_id: 'user-004', attended: false },

  // user-005 鈴木 3/6
  { session_id: 'ps-001', member_id: 'user-005', attended: true },
  { session_id: 'ps-002', member_id: 'user-005', attended: false },
  { session_id: 'ps-003', member_id: 'user-005', attended: true },
  { session_id: 'ps-004', member_id: 'user-005', attended: false },
  { session_id: 'ps-005', member_id: 'user-005', attended: false },
  { session_id: 'ps-006', member_id: 'user-005', attended: true },

  // user-006 伊藤 6/6
  { session_id: 'ps-001', member_id: 'user-006', attended: true },
  { session_id: 'ps-002', member_id: 'user-006', attended: true },
  { session_id: 'ps-003', member_id: 'user-006', attended: true },
  { session_id: 'ps-004', member_id: 'user-006', attended: true },
  { session_id: 'ps-005', member_id: 'user-006', attended: true },
  { session_id: 'ps-006', member_id: 'user-006', attended: true },

  // user-007 中村 2/6
  { session_id: 'ps-001', member_id: 'user-007', attended: false },
  { session_id: 'ps-002', member_id: 'user-007', attended: true },
  { session_id: 'ps-003', member_id: 'user-007', attended: false },
  { session_id: 'ps-004', member_id: 'user-007', attended: false },
  { session_id: 'ps-005', member_id: 'user-007', attended: true },
  { session_id: 'ps-006', member_id: 'user-007', attended: false },

  // user-008 小林 4/6
  { session_id: 'ps-001', member_id: 'user-008', attended: true },
  { session_id: 'ps-002', member_id: 'user-008', attended: true },
  { session_id: 'ps-003', member_id: 'user-008', attended: false },
  { session_id: 'ps-004', member_id: 'user-008', attended: true },
  { session_id: 'ps-005', member_id: 'user-008', attended: true },
  { session_id: 'ps-006', member_id: 'user-008', attended: false },
]

export function getPracticeSessions(): PracticeSession[] {
  return [...MOCK_PRACTICE_SESSIONS].sort((a, b) => b.date.localeCompare(a.date))
}
export function getMemberAttendance(memberId: string): (PracticeAttendance & { date: string })[] {
  return MOCK_PRACTICE_ATTENDANCE
    .filter(a => a.member_id === memberId)
    .map(a => {
      const s = MOCK_PRACTICE_SESSIONS.find(x => x.id === a.session_id)
      return { ...a, date: s?.date ?? '' }
    })
}
export function getMemberAttendanceRate(
  memberId: string,
  monthsBack = 3,
): { attended: number; total: number; pct: number } {
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate())
  const rows = MOCK_PRACTICE_ATTENDANCE.filter(a => a.member_id === memberId).filter(a => {
    const s = MOCK_PRACTICE_SESSIONS.find(x => x.id === a.session_id)
    if (!s) return false
    return new Date(s.date) >= cutoff
  })
  const attended = rows.filter(a => a.attended).length
  const total = rows.length
  return { attended, total, pct: total === 0 ? 0 : Math.round((attended / total) * 100) }
}
export function getMemberConsecutiveAttendance(memberId: string): number {
  const sorted = MOCK_PRACTICE_SESSIONS
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
  let count = 0
  for (const s of sorted) {
    const a = MOCK_PRACTICE_ATTENDANCE.find(x => x.session_id === s.id && x.member_id === memberId)
    if (a?.attended) count++
    else break
  }
  return count
}

// ============================================================
// マイ目標
// ============================================================

export type MemberGoal = {
  id: string
  member_id: string
  skill_type: 'instrument' | 'dance'
  song_id: string
  position_id: string
  created_at: string
  achieved: boolean
  achieved_at: string | null
}

export const MOCK_GOALS: MemberGoal[] = [
  { id: 'goal-001', member_id: 'user-002', skill_type: 'instrument', song_id: 'kuniga', position_id: 'fue',     created_at: '2026-04-01T10:00:00Z', achieved: false, achieved_at: null },
  { id: 'goal-002', member_id: 'user-002', skill_type: 'dance',      song_id: 'yatai',  position_id: 'shishimai', created_at: '2026-04-01T10:00:00Z', achieved: false, achieved_at: null },
  { id: 'goal-003', member_id: 'user-004', skill_type: 'instrument', song_id: 'ninba',  position_id: 'fue',     created_at: '2026-03-15T10:00:00Z', achieved: false, achieved_at: null },
  { id: 'goal-004', member_id: 'user-005', skill_type: 'instrument', song_id: 'yatai',  position_id: 'fue',     created_at: '2026-02-01T10:00:00Z', achieved: true,  achieved_at: '2026-03-20T10:00:00Z' },
  { id: 'goal-005', member_id: 'user-005', skill_type: 'dance',      song_id: 'ninba',  position_id: 'hyottoko', created_at: '2026-04-01T10:00:00Z', achieved: false, achieved_at: null },
  { id: 'goal-006', member_id: 'user-007', skill_type: 'instrument', song_id: 'ninba',  position_id: 'ookan',   created_at: '2026-04-05T10:00:00Z', achieved: false, achieved_at: null },
]

export function getMemberGoals(memberId: string): MemberGoal[] {
  return MOCK_GOALS.filter(g => g.member_id === memberId)
}

// ============================================================
// 入会希望申請
// ============================================================

export type RegistrationRequest = {
  id: string
  display_name: string
  furigana: string
  email: string
  join_year: number | null
  message: string | null
  status: 'pending' | 'approved' | 'deleted'
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export const MOCK_REGISTRATION_REQUESTS: RegistrationRequest[] = [
  {
    id: 'reg-001',
    display_name: '渡辺 裕子',
    furigana: 'わたなべ ゆうこ',
    email: 'watanabe@example.com',
    join_year: 2026,
    message: '高橋さんの紹介で入会希望です。',
    status: 'pending',
    created_at: '2026-04-11T10:00:00Z',
    reviewed_at: null,
    reviewed_by: null,
  },
  {
    id: 'reg-002',
    display_name: '松本 翔太',
    furigana: 'まつもと しょうた',
    email: 'matsumoto@example.com',
    join_year: 2026,
    message: null,
    status: 'pending',
    created_at: '2026-04-12T08:00:00Z',
    reviewed_at: null,
    reviewed_by: null,
  },
]

export function getPendingRegistrationCount(): number {
  return MOCK_REGISTRATION_REQUESTS.filter(r => r.status === 'pending').length
}
export function formatGoalLabel(g: MemberGoal): string {
  const song = getSongById(g.song_id)
  if (g.skill_type === 'instrument') {
    const inst = getInstrumentById(g.position_id)
    return `${song?.name ?? '?'} × ${inst?.name ?? '?'}（${inst?.alias ?? '?'}）`
  }
  const dance = getDanceById(g.position_id)
  return `${song?.name ?? '?'} × ${dance?.name ?? '?'}`
}
