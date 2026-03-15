import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = params.get('access_token')
    if (token) {
      setAuth(token)
      navigate('/home', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [params, navigate, setAuth])

  return (
    <div
      style={{
        background: 'var(--bg)',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--amber)',
          letterSpacing: '0.1em',
        }}
      >
        // PROCESSING...
      </p>
    </div>
  )
}
