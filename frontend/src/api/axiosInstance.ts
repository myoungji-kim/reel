import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

// 일반 요청용 인스턴스
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // httpOnly 쿠키(Refresh Token) 포함
})

// Refresh 전용 인스턴스 — 인터셉터 무한루프 방지
const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// ── 요청 인터셉터: Authorization 헤더 자동 주입
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── 응답 인터셉터: 401 → 토큰 갱신 후 원래 요청 재시도
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 탈퇴/삭제된 유저 — JWT는 유효하지만 DB에 유저가 없는 경우 강제 로그아웃
    // refreshAxios로 logout 호출해 서버 쿠키까지 만료시켜야 무한루프 방지
    if (error.response?.status === 404 &&
        error.response?.data?.message === '사용자를 찾을 수 없습니다.') {
      useAuthStore.getState().clearAuth()
      await refreshAxios.post('/api/auth/logout').catch(() => {})
      window.location.replace('/')
      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosInstance(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await refreshAxios.post<{ data: { accessToken: string } }>(
        '/api/auth/refresh',
      )
      const newToken = data.data.accessToken
      useAuthStore.getState().setAuth(newToken)
      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      useAuthStore.getState().clearAuth()
      window.location.href = '/'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosInstance
