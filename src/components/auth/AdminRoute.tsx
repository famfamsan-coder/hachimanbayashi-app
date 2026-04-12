import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading, isAdmin } = useAuth()

  if (loading) {
    return <div className="flex h-full items-center justify-center">読み込み中...</div>
  }

  if (!session) return <Navigate to="/login" replace />
  if (!profile || !isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
