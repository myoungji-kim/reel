import axiosInstance from './axiosInstance'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

export interface MoodDist {
  mood: string
  count: number
  ratio: number
}

export interface ProfileResponse {
  user: {
    nickname: string
    avatarUrl: string | null
    initial: string
    joinedAt: string
    bio: string
  }
  journey: {
    totalFrames: number
    completedRolls: number
    bestStreak: number
    topMood: string | null
    moodDistribution: MoodDist[]
  }
  rolls: {
    active: {
      rollNumber: number
      title: string | null
      currentFrames: number
      totalFrames: number
      remaining: number
    }
    completed: Array<{
      rollNumber: number
      title: string
      frameCount: number
      startDate: string
      endDate: string
    }>
  }
}

export const getProfile = () =>
  axiosInstance.get<ApiResponse<ProfileResponse>>('/api/profile').then(r => r.data.data)

export const withdrawAccount = () =>
  axiosInstance.delete('/api/profile/withdraw')
