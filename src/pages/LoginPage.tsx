import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex h-full items-center justify-center">読み込み中...</div>
  }
  if (session) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-full items-center justify-center">
      <LoginForm />
    </div>
  )
}
