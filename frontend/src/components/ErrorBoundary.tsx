import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#131008',
            color: '#f2e8d0',
            gap: '16px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: '32px' }}>⚠️</div>
          <p style={{ fontSize: '16px', color: '#c8b898' }}>
            예상치 못한 오류가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 20px',
              background: '#d4822a',
              color: '#131008',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
