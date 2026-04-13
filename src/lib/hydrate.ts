import { supabase } from './supabase'
import { IS_MOCK_MODE } from './config'
import {
  MEMBERS,
  MOCK_INSTRUMENT_SKILLS,
  MOCK_DANCE_SKILLS,
  MOCK_ANNOUNCEMENTS,
  MOCK_EVENTS,
  MOCK_EVENT_RESPONSES,
  MOCK_VIDEOS,
  MOCK_REGISTRATION_REQUESTS,
  MOCK_FORMATIONS,
  MOCK_PRACTICE_SESSIONS,
  MOCK_PRACTICE_ATTENDANCE,
  MOCK_GOALS,
  type InstrumentSkill,
  type DanceSkill,
  type Announcement,
  type EventItem,
  type EventResponse,
  type PracticeVideo,
  type RegistrationRequest,
  type Formation,
  type FormationProgram,
  type FormationAssignment,
  type PracticeSession,
  type PracticeAttendance,
  type MemberGoal,
} from './mockData'
import type { Profile } from '@/types/database'

// ============================================================
// Supabase モードで起動直後に MOCK_* 配列を Supabase から置き換える。
// 既存コンポーネントは MOCK_* を直接参照しているため、ブート時に中身を
// 差し替えれば透過的に Supabase データで動作する。
//
// 書き込み操作は現時点では MOCK_* 配列だけを更新するため、ページ遷移
// またはリロードまで Supabase 側の変更が反映されないことに注意。
// 将来的に書き込み層を dual-write に切り替えれば完全同期可能。
// ============================================================

function replace<T>(arr: T[], next: T[]) {
  arr.splice(0, arr.length, ...next)
}

let hydrateError: string | null = null
export function getHydrateError(): string | null {
  return hydrateError
}

export async function hydrateFromSupabase(): Promise<void> {
  if (IS_MOCK_MODE || !supabase) return
  hydrateError = null

  try {
    const [
      profilesRes,
      instSkillsRes,
      danceSkillsRes,
      annRes,
      eventsRes,
      responsesRes,
      videosRes,
      regRes,
      sessionsRes,
      attendanceRes,
      goalsRes,
      formationsRes,
      programsRes,
      assignmentsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').is('deleted_at', null).order('created_at'),
      supabase.from('member_instrument_skills').select('*'),
      supabase.from('member_dance_skills').select('*'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('event_date'),
      supabase.from('event_responses').select('*'),
      supabase.from('practice_videos').select('*').order('sort_order'),
      supabase.from('registration_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('practice_sessions').select('*').order('date', { ascending: false }),
      supabase.from('practice_attendance').select('*'),
      supabase.from('member_goals').select('*'),
      supabase.from('formations').select('*').order('created_at', { ascending: false }),
      supabase.from('formation_programs').select('*').order('program_order'),
      supabase.from('formation_assignments').select('*'),
    ])

    const responsesWithLabel: Array<[string, { error: { message: string } | null }]> = [
      ['profiles', profilesRes],
      ['member_instrument_skills', instSkillsRes],
      ['member_dance_skills', danceSkillsRes],
      ['announcements', annRes],
      ['events', eventsRes],
      ['event_responses', responsesRes],
      ['practice_videos', videosRes],
      ['registration_requests', regRes],
      ['practice_sessions', sessionsRes],
      ['practice_attendance', attendanceRes],
      ['member_goals', goalsRes],
      ['formations', formationsRes],
      ['formation_programs', programsRes],
      ['formation_assignments', assignmentsRes],
    ]
    const failed = responsesWithLabel
      .filter(([, r]) => r.error)
      .map(([label, r]) => `${label}: ${r.error!.message}`)
    if (failed.length > 0) {
      hydrateError = `一部テーブルの取得に失敗しました — ${failed.join(' / ')}`
      console.error('[hydrate]', hydrateError)
    }

    if (profilesRes.data) replace(MEMBERS, profilesRes.data as Profile[])

    if (instSkillsRes.data) {
      const rows = instSkillsRes.data as Array<{
        id: string
        member_id: string
        song_id: string
        instrument_id: string
        granted_at: string
      }>
      replace<InstrumentSkill>(
        MOCK_INSTRUMENT_SKILLS,
        rows.map(r => ({
          id: r.id,
          member_id: r.member_id,
          song_id: r.song_id,
          instrument_id: r.instrument_id,
          granted_at: r.granted_at,
        })),
      )
    }

    if (danceSkillsRes.data) {
      const rows = danceSkillsRes.data as Array<{
        id: string
        member_id: string
        song_id: string
        dance_id: string
        granted_at: string
      }>
      replace<DanceSkill>(
        MOCK_DANCE_SKILLS,
        rows.map(r => ({
          id: r.id,
          member_id: r.member_id,
          song_id: r.song_id,
          dance_id: r.dance_id,
          granted_at: r.granted_at,
        })),
      )
    }

    if (annRes.data) replace<Announcement>(MOCK_ANNOUNCEMENTS, annRes.data as Announcement[])

    if (eventsRes.data) {
      const rows = eventsRes.data as Array<{
        id: string
        title: string
        description: string | null
        event_date: string
        event_time: string | null
        location: string | null
        created_at: string
      }>
      replace<EventItem>(MOCK_EVENTS, rows)
    }

    if (responsesRes.data) {
      const rows = responsesRes.data as Array<{
        event_id: string
        member_id: string
        status: 'attend' | 'absent' | 'pending'
        comment: string | null
      }>
      replace<EventResponse>(MOCK_EVENT_RESPONSES, rows)
    }

    if (videosRes.data) {
      const rows = videosRes.data as Array<{
        id: string
        song_id: string
        video_type: 'instrument' | 'dance' | 'ensemble'
        instrument_id: string | null
        dance_id: string | null
        youtube_url: string
        title: string | null
        description: string | null
        sort_order: number
      }>
      replace<PracticeVideo>(MOCK_VIDEOS, rows)
    }

    if (regRes.data) {
      replace<RegistrationRequest>(
        MOCK_REGISTRATION_REQUESTS,
        regRes.data as RegistrationRequest[],
      )
    }

    if (sessionsRes.data) {
      replace<PracticeSession>(MOCK_PRACTICE_SESSIONS, sessionsRes.data as PracticeSession[])
    }

    if (attendanceRes.data) {
      replace<PracticeAttendance>(
        MOCK_PRACTICE_ATTENDANCE,
        attendanceRes.data as PracticeAttendance[],
      )
    }

    if (goalsRes.data) {
      replace<MemberGoal>(MOCK_GOALS, goalsRes.data as MemberGoal[])
    }

    if (formationsRes.data && programsRes.data && assignmentsRes.data) {
      const programs = programsRes.data as Array<{
        id: string
        formation_id: string
        song_id: string
        program_order: number
      }>
      const assignments = assignmentsRes.data as Array<{
        program_id: string
        position_type: 'instrument' | 'dance'
        position_id: string
        member_id: string | null
      }>
      const formations = (formationsRes.data as Array<{
        id: string
        title: string
        event_id: string | null
        created_at: string
        updated_at: string
      }>).map<Formation>(f => {
        const fPrograms: FormationProgram[] = programs
          .filter(p => p.formation_id === f.id)
          .map(p => {
            const pAssignments: FormationAssignment[] = assignments
              .filter(a => a.program_id === p.id)
              .map(a => ({
                program_id: p.id,
                position_type: a.position_type,
                position_id: a.position_id,
                member_id: a.member_id,
              }))
            return {
              id: p.id,
              formation_id: p.formation_id,
              song_id: p.song_id,
              program_order: p.program_order,
              assignments: pAssignments,
            }
          })
        return {
          id: f.id,
          title: f.title,
          event_id: f.event_id,
          created_at: f.created_at,
          updated_at: f.updated_at,
          programs: fPrograms,
        }
      })
      replace<Formation>(MOCK_FORMATIONS, formations)
    }
  } catch (err) {
    console.error('Supabase からのデータ取得に失敗しました:', err)
    hydrateError = err instanceof Error ? err.message : String(err)
  }
}
