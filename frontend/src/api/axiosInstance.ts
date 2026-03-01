import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // httpOnly 쿠키 (Refresh Token) 포함
})

// TODO: Phase 3 — 요청 인터셉터: Authorization 헤더 주입
// TODO: Phase 3 — 응답 인터셉터: 401 시 토큰 갱신 후 재시도

export default axiosInstance
