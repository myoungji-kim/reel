import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './styles/index.css'
import { useAuthStore } from './stores/authStore'
import { useToastStore } from './stores/toastStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/'
      } else {
        useToastStore.getState().show('오류가 발생했습니다.', 'error')
        setTimeout(() => useToastStore.getState().hide(), 3000)
      }
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
