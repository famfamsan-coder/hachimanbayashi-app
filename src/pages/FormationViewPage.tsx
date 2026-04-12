import { Link, Navigate, useParams } from 'react-router-dom'
import {
  MOCK_EVENTS,
  SONGS,
  getFormationById,
  getMemberById,
  getPositionsForSong,
} from '@/lib/mockData'

export default function FormationViewPage() {
  const { id } = useParams<{ id: string }>()
  const formation = id ? getFormationById(id) : undefined

  if (!formation) return <Navigate to="/events" replace />

  const event = formation.event_id
    ? MOCK_EVENTS.find(e => e.id === formation.event_id)
    : null

  return (
    <div className="space-y-5">
      <Link
        to="/events"
        className="no-print inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← イベント一覧に戻る
      </Link>

      <div className="print-only mb-4 border-b border-black pb-2">
        <h1 className="text-lg font-bold">八幡ばやし保存会 編成表</h1>
        <p className="text-sm">{formation.title}</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="no-print mb-3 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{formation.title}</h1>
            {event && (
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">🎪 {event.title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="shrink-0 rounded-lg border border-[var(--color-primary)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary)] hover:text-white"
          >
            🖨️ 印刷する
          </button>
        </div>

        {formation.programs.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-ink-muted)]">
            演目が登録されていません
          </p>
        ) : (
          <div className="space-y-5 print:space-y-3">
            {formation.programs.map(p => {
              const song = SONGS.find(s => s.id === p.song_id)
              const positions = getPositionsForSong(p.song_id)
              return (
                <div key={p.id} className="print:break-inside-avoid">
                  <h2 className="mb-2 text-base font-bold">
                    【第{p.program_order}演目】{song?.name ?? '-'}
                  </h2>
                  <table className="print-table w-full text-sm">
                    <tbody>
                      {positions.map(pos => {
                        const assignment = p.assignments.find(
                          a => a.position_type === pos.type && a.position_id === pos.id,
                        )
                        const member = assignment?.member_id
                          ? getMemberById(assignment.member_id)
                          : null
                        return (
                          <tr
                            key={`${pos.type}::${pos.id}`}
                            className="border-t border-gray-100"
                          >
                            <td className="w-40 px-3 py-2 font-medium">{pos.label}</td>
                            <td className="px-3 py-2">
                              {member ? (
                                member.display_name
                              ) : (
                                <span className="text-red-500">未配置</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
