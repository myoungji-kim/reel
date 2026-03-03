import { useCallback } from 'react'
import { useToastStore } from '../stores/toastStore'
import type { ToastType } from '../stores/toastStore'

const SUCCESS_DURATION = 3000

export function useToast() {
  const { show, hide } = useToastStore()

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      show(message, type)
      if (type === 'success') {
        setTimeout(hide, SUCCESS_DURATION)
      }
    },
    [show, hide],
  )

  return { showToast }
}
