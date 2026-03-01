import { useCallback } from 'react'
import { useToastStore } from '../stores/toastStore'

const TOAST_DURATION = 3000

export function useToast() {
  const { show, hide } = useToastStore()

  const showToast = useCallback(
    (message: string) => {
      show(message)
      setTimeout(hide, TOAST_DURATION)
    },
    [show, hide],
  )

  return { showToast }
}
