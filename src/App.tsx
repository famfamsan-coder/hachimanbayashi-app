import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import MembersPage from '@/pages/MembersPage'
import MemberDetailPage from '@/pages/MemberDetailPage'
import PracticePage from '@/pages/PracticePage'
import PracticeDetailPage from '@/pages/PracticeDetailPage'
import EventsPage from '@/pages/EventsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import AdminMembersPage from '@/pages/admin/AdminMembersPage'
import AdminMemberSkillsPage from '@/pages/admin/AdminMemberSkillsPage'
import AdminAnnouncementsPage from '@/pages/admin/AdminAnnouncementsPage'
import AdminEventsPage from '@/pages/admin/AdminEventsPage'
import AdminVideosPage from '@/pages/admin/AdminVideosPage'
import AdminFormationsPage from '@/pages/admin/AdminFormationsPage'
import AdminFormationEditPage from '@/pages/admin/AdminFormationEditPage'
import AdminAttendancePage from '@/pages/admin/AdminAttendancePage'
import AdminRegistrationsPage from '@/pages/admin/AdminRegistrationsPage'
import FormationViewPage from '@/pages/FormationViewPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/"              element={<HomePage />} />
            <Route path="/profile"       element={<ProfilePage />} />
            <Route path="/members"       element={<MembersPage />} />
            <Route path="/members/:id"   element={<MemberDetailPage />} />
            <Route path="/practice"         element={<PracticePage />} />
            <Route path="/practice/:songId" element={<PracticeDetailPage />} />
            <Route path="/events"           element={<EventsPage />} />
            <Route path="/events/:id"       element={<EventDetailPage />} />
            <Route path="/formations/:id"   element={<FormationViewPage />} />

            <Route path="/admin/members"              element={<AdminRoute><AdminMembersPage /></AdminRoute>} />
            <Route path="/admin/members/:id/skills"   element={<AdminRoute><AdminMemberSkillsPage /></AdminRoute>} />
            <Route path="/admin/announcements"        element={<AdminRoute><AdminAnnouncementsPage /></AdminRoute>} />
            <Route path="/admin/events"               element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
            <Route path="/admin/videos"               element={<AdminRoute><AdminVideosPage /></AdminRoute>} />
            <Route path="/admin/formations"           element={<AdminRoute><AdminFormationsPage /></AdminRoute>} />
            <Route path="/admin/formations/:id"       element={<AdminRoute><AdminFormationEditPage /></AdminRoute>} />
            <Route path="/admin/attendance"           element={<AdminRoute><AdminAttendancePage /></AdminRoute>} />
            <Route path="/admin/registrations"        element={<AdminRoute><AdminRegistrationsPage /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
