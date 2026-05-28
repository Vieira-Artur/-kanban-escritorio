import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './components/LoginPage.jsx'
import AccessDenied from './components/AccessDenied.jsx'
import BoardSkeleton from './components/BoardSkeleton.jsx'

import { lazy, Suspense } from 'react'
const BoardPage = lazy(() => import('./pages/BoardPage.jsx'))
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

function AuthGuard({ children, requireAdmin = false }) {
  const { user, isAuthorized, isAdmin, loading, login, logout } = useAuth()

  if (loading) return <BoardSkeleton />

  if (!user) return <LoginPage onLogin={login} />
  if (!isAuthorized) return <AccessDenied onLogout={logout} />
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <BrowserRouter basename="/-kanban-escritorio">
      <Suspense fallback={<BoardSkeleton />}>
        <Routes>
          <Route path="/" element={
            <AuthGuard>
              <BoardPage />
            </AuthGuard>
          } />
          <Route path="/admin" element={
            <AuthGuard requireAdmin>
              <AdminPage />
            </AuthGuard>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
