import { useState, useMemo } from 'react'
import {
  MOCK_PRACTICE_SESSIONS,
  MOCK_PRACTICE_ATTENDANCE,
  getMemberAttendanceRate,
  getMemberConsecutiveAttendance,
} from '@/lib/mockData'

type DayCell = {
  date: Date
  inMonth: boolean
  key: string // YYYY-MM-DD
}

function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay() // 0=sun
  const startDate = new Date(year, month, 1 - startWeekday)
  const cells: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    cells.push({ date: d, inMonth: d.getMonth() === month, key: ymd(d) })
  }
  return cells
}

export function AttendanceCalendar({ memberId }: { memberId: string }) {
  const today = new Date()
  const [viewY, setViewY] = useState(today.getFullYear())
  const [viewM, setViewM] = useState(today.getMonth())

  const cells = useMemo(() => buildMonthGrid(viewY, viewM), [viewY, viewM])

  const sessionsByDate = useMemo(() => {
    const m = new Map<string, string>() // date -> session_id
    for (const s of MOCK_PRACTICE_SESSIONS) m.set(s.date, s.id)
    return m
  }, [])

  const attendanceByKey = useMemo(() => {
    const m = new Map<string, boolean>() // session_id -> attended
    for (const a of MOCK_PRACTICE_ATTENDANCE) {
      if (a.member_id === memberId) m.set(a.session_id, a.attended)
    }
    return m
  }, [memberId])

  const rate = getMemberAttendanceRate(memberId, 3)
  const streak = getMemberConsecutiveAttendance(memberId)

  const prevMonth = () => {
    if (viewM === 0) {
      setViewY(y => y - 1)
      setViewM(11)
    } else setViewM(m => m - 1)
  }
  const nextMonth = () => {
    if (viewM === 11) {
      setViewY(y => y + 1)
      setViewM(0)
    } else setViewM(m => m + 1)
  }

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        >
          ◀ 前月
        </button>
        <p className="text-sm font-bold">
          {viewY}年 {viewM + 1}月
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        >
          次月 ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekdays.map((w, i) => (
          <div
            key={w}
            className={`py-1 font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-[var(--color-ink-muted)]'}`}
          >
            {w}
          </div>
        ))}
        {cells.map(c => {
          const sessionId = sessionsByDate.get(c.key)
          const isFuture = c.date.getTime() > today.getTime()
          let dot: React.ReactNode = null
          if (sessionId) {
            if (attendanceByKey.has(sessionId)) {
              dot = attendanceByKey.get(sessionId) ? (
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              ) : (
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              )
            } else {
              dot = (
                <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
              )
            }
          }
          return (
            <div
              key={c.key}
              className={`flex aspect-square flex-col items-center justify-center rounded ${
                c.inMonth ? 'bg-white' : 'bg-gray-50 text-gray-300'
              } ${isFuture && c.inMonth ? 'text-gray-400' : ''}`}
            >
              <span className="text-[11px]">{c.date.getDate()}</span>
              {dot}
            </div>
          )
        })}
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-xs text-[var(--color-ink-muted)]">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            直近3ヶ月の出席率:{' '}
            <b className="text-base text-[var(--color-ink)]">{rate.pct}%</b>（{rate.attended}/{rate.total}回）
          </span>
          {streak > 0 && (
            <span className="text-green-600">
              🔥 現在 <b className="text-base">{streak}</b>回連続出席中！
            </span>
          )}
        </div>
      </div>

      <ContributionGraph memberId={memberId} />
    </div>
  )
}

function ContributionGraph({ memberId }: { memberId: string }) {
  const today = new Date()
  const weeks = 26 // 約6ヶ月分
  // 今日を含む週の土曜までを右端に揃える
  const endSaturday = new Date(today)
  endSaturday.setDate(today.getDate() + (6 - today.getDay()))
  const startSunday = new Date(endSaturday)
  startSunday.setDate(endSaturday.getDate() - (weeks * 7 - 1))

  const sessionsByDate = new Map<string, string>()
  for (const s of MOCK_PRACTICE_SESSIONS) sessionsByDate.set(s.date, s.id)

  const attendedByKey = new Map<string, boolean>()
  for (const a of MOCK_PRACTICE_ATTENDANCE) {
    if (a.member_id !== memberId) continue
    const s = MOCK_PRACTICE_SESSIONS.find(x => x.id === a.session_id)
    if (s) attendedByKey.set(s.date, a.attended)
  }

  const cells: { key: string; state: 'none' | 'attended' | 'missed' }[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startSunday)
    d.setDate(startSunday.getDate() + i)
    const key = ymd(d)
    if (attendedByKey.has(key)) {
      cells.push({ key, state: attendedByKey.get(key) ? 'attended' : 'missed' })
    } else {
      cells.push({ key, state: 'none' })
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs text-[var(--color-ink-muted)]">過去6ヶ月の練習出席</p>
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
          gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
          gridAutoFlow: 'column',
        }}
      >
        {cells.map(c => (
          <div
            key={c.key}
            title={c.key}
            className={`aspect-square rounded-[2px] ${
              c.state === 'attended'
                ? 'bg-green-500'
                : c.state === 'missed'
                  ? 'bg-red-200'
                  : 'bg-gray-100'
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-ink-muted)]">
        <span className="inline-block h-2 w-2 rounded-[1px] bg-gray-100" /> 練習なし
        <span className="inline-block h-2 w-2 rounded-[1px] bg-green-500" /> 出席
        <span className="inline-block h-2 w-2 rounded-[1px] bg-red-200" /> 欠席
      </div>
    </div>
  )
}
