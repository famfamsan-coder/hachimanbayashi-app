export type DisplayStatus = 'attend' | 'absent' | 'pending' | 'no_reply'

const STATUS_MAP: Record<DisplayStatus, { label: string; cls: string }> = {
  attend:   { label: '出席',   cls: 'bg-green-100 text-green-800' },
  absent:   { label: '欠席',   cls: 'bg-red-100 text-red-800' },
  pending:  { label: '調整中', cls: 'bg-amber-100 text-amber-800' },
  no_reply: { label: '未回答', cls: 'bg-gray-100 text-gray-500' },
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const s = STATUS_MAP[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

export function statusLabel(status: DisplayStatus): string {
  return STATUS_MAP[status].label
}
