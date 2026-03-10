import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from './stores/authStore'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>
}

export default function App() {
  const [initializing, setInitializing] = useState(true)
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    axios
      .post<{ data: { accessToken: string } }>(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
        null,
        { withCredentials: true },
      )
      .then(({ data }) => setAuth(data.data.accessToken))
      .catch(() => {})
      .finally(() => setInitializing(false))
  }, [setAuth])

  if (initializing) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  )
}
