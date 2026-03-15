import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from './stores/authStore'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import Toast from './components/Toast'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <>{children}</> : <Navigate to="/" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return accessToken ? <Navigate to="/home" replace /> : <>{children}</>
}

export default function App() {
  const [initializing, setInitializing] = useState(true)
  const setAuth = useAuthStore((s) => s.setAuth)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  useEffect(() => {
    // localStorage에 유효한 토큰이 있으면 refresh 호출 생략
    if (isAuthenticated) {
      setInitializing(false)
      return
    }

    axios
      .post<{ data: { accessToken: string } }>(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
        null,
        { withCredentials: true },
      )
      .then(({ data }) => setAuth(data.data.accessToken))
      .catch(() => {})
      .finally(() => setInitializing(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 다른 탭에서 로그아웃하면 이 탭도 로그아웃
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'reel_at' && e.newValue === null) {
        useAuthStore.getState().clearAuth()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

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
