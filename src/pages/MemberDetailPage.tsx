import { Link, Navigate, useParams } from 'react-router-dom'
import { MemberProfileView } from '@/components/member/MemberProfileView'
import { getMemberById } from '@/lib/mockData'

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const member = id ? getMemberById(id) : undefined

  if (!member || member.deleted_at) return <Navigate to="/members" replace />

  return (
    <div className="space-y-4">
      <Link
        to="/members"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        ← メンバー一覧に戻る
      </Link>
      <MemberProfileView profile={member} showEdit={false} />
    </div>
  )
}
