import { useCallback } from 'react'
import { useToastStore } from '../stores/toastStore'
import type { ToastType } from '../stores/toastStore'

const SUCCESS_DURATION = 3000
const UNDO_DURATION = 4000

export function useToast() {
  const { show, hide } = useToastStore()

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', undoAction?: () => void) => {
      show(message, type, undoAction)
      if (type === 'success') {
        setTimeout(hide, undoAction ? UNDO_DURATION : SUCCESS_DURATION)
      }
    },
    [show, hide],
  )

  return { showToast }
}
