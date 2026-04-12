import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MOCK_PRACTICE_SESSIONS,
  MOCK_PRACTICE_ATTENDANCE,
  getVisibleMembers,
  type PracticeSession,
  type PracticeAttendance,
} from '@/lib/mockData'

export default function AdminAttendancePage() {
  const [sessions, setSessions] = useState<PracticeSession[]>(
    [...MOCK_PRACTICE_SESSIONS].sort((a, b) => b.date.localeCompare(a.date)),
  )
  const [attendance, setAttendance] = useState<PracticeAttendance[]>(MOCK_PRACTICE_ATTENDANCE)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: '定例練習',
    location: '日の出町公民館',
    note: '',
  })

  const members = getVisibleMembers()

  const addSession = () => {
    if (!form.date || !form.title) {
      alert('日付とタイトルは必須です')
      return
    }
    const id = `ps-${Date.now()}`
    const newSession: PracticeSession = {
      id,
      date: form.date,
      title: form.title,
      location: form.location || null,
      note: form.note || null,
      created_at: new Date().toISOString(),
    }
    const newList = [newSession, ...sessions].sort((a, b) => b.date.localeCompare(a.date))
    setSessions(newList)
    MOCK_PRACTICE_SESSIONS.push(newSession)
    setShowForm(false)
    setForm({
      date: new Date().toISOString().slice(0, 10),
      title: '定例練習',
      location: '日の出町公民館',
      note: '',
    })
  }

  const removeSession = (id: string) => {
    if (!confirm('この練習日を削除しますか？')) return
    setSessions(prev => prev.filter(s => s.id !== id))
    const idx = MOCK_PRACTICE_SESSIONS.findIndex(s => s.id === id)
    if (idx >= 0) MOCK_PRACTICE_SESSIONS.splice(idx, 1)
  }

  const toggleAttendance = (sessionId: string, memberId: string) => {
    const existing = attendance.find(a => a.session_id === sessionId && a.member_id === memberId)
    let next: PracticeAttendance[]
    if (existing) {
      next = attendance.map(a =>
        a.session_id === sessionId && a.member_id === memberId
          ? { ...a, attended: !a.attended }
          : a,
      )
    } else {
      next = [...attendance, { session_id: sessionId, member_id: memberId, attended: true }]
    }
    setAttendance(next)
    syncToMock(next)
  }

  const setAllForSession = (sessionId: string, attended: boolean) => {
    const others = attendance.filter(a => a.session_id !== sessionId)
    const rows: PracticeAttendance[] = members.map(m => ({
      session_id: sessionId,
      member_id: m.id,
      attended,
    }))
    const next = [...others, ...rows]
    setAttendance(next)
    syncToMock(next)
  }

  const syncToMock = (next: PracticeAttendance[]) => {
    MOCK_PRACTICE_ATTENDANCE.splice(0, MOCK_PRACTICE_ATTENDANCE.length, ...next)
  }

  const getSessionAttendance = (sessionId: string) =>
    attendance.filter(a => a.session_id === sessionId && a.attended).length

  return (
    <div className="space-y-5">
      <Link
        to="/profile"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← マイページに戻る
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">📅 練習出席管理</h1>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm"
        >
          ＋ 練習日を追加
        </button>
      </div>

      {showForm && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-[var(--color-ink-muted)]">日付</span>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-[var(--color-ink-muted)]">タイトル</span>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-[var(--color-ink-muted)]">場所</span>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-[var(--color-ink-muted)]">メモ</span>
              <textarea
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-[var(--color-ink-muted)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={addSession}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white"
              >
                追加
              </button>
            </div>
          </div>
        </section>
      )}

      <ul className="space-y-3">
        {sessions.map(s => {
          const isOpen = openId === s.id
          const attendedCount = getSessionAttendance(s.id)
          return (
            <li key={s.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : s.id)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--color-ink-muted)]">{s.date}</p>
                  <p className="truncate text-sm font-bold">{s.title}</p>
                  {s.location && (
                    <p className="truncate text-xs text-[var(--color-ink-muted)]">📍 {s.location}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-[var(--color-ink-muted)]">出席</p>
                  <p className="text-base font-bold">
                    {attendedCount}/{members.length}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAllForSession(s.id, true)}
                      className="rounded-lg border border-green-500 px-3 py-1 text-xs text-green-600 hover:bg-green-50"
                    >
                      全員出席
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllForSession(s.id, false)}
                      className="rounded-lg border border-red-500 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      全員欠席
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSession(s.id)}
                      className="ml-auto rounded-lg border border-red-300 px-3 py-1 text-xs text-red-500"
                    >
                      この練習日を削除
                    </button>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {members.map(m => {
                      const row = attendance.find(
                        a => a.session_id === s.id && a.member_id === m.id,
                      )
                      const attended = row?.attended ?? false
                      return (
                        <li key={m.id} className="flex items-center justify-between py-2">
                          <span className="text-sm">{m.display_name}</span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={attended}
                              onChange={() => toggleAttendance(s.id, m.id)}
                              className="h-5 w-5 cursor-pointer accent-[var(--color-primary)]"
                            />
                            <span className="text-xs text-[var(--color-ink-muted)]">出席</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
