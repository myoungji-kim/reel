import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { updateRollTitle, suggestRollTitle } from '../../api/rollApi'
import { useToast } from '../../hooks/useToast'
import OverlaySheet from './OverlaySheet'

interface Props {
  isOpen: boolean
  rollNum: number | null
  currentTitle: string | null
  onClose: () => void
}

export default function RollTitleSheet({ isOpen, rollNum, currentTitle, onClose }: Props) {
  const [inputValue, setInputValue] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isOpen) setInputValue(currentTitle ?? '')
  }, [isOpen, currentTitle])

  const handleClose = () => {
    setInputValue('')
    onClose()
  }

  const handleSuggest = async () => {
    if (!rollNum || suggesting) return
    setSuggesting(true)
    try {
      const { suggested } = await suggestRollTitle(rollNum)
      setInputValue(suggested)
    } catch {
      showToast('AI 제안에 실패했어요.', 'error')
    } finally {
      setSuggesting(false)
    }
  }

  const handleSave = async () => {
    if (!rollNum || !inputValue.trim() || saving) return
    setSaving(true)
    try {
      await updateRollTitle(rollNum, inputValue.trim())
      await queryClient.invalidateQueries({ queryKey: ['rolls'] })
      showToast('롤 이름이 저장됐어요.')
      handleClose()
    } catch {
      showToast('저장에 실패했어요.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const rollLabel = String(rollNum ?? 1).padStart(2, '0')

  return (
    <OverlaySheet isOpen={isOpen} zIndex={450} onBackdropClick={handleClose}>
      <div>
        {/* 헤더 */}
        <div style={styles.header}>
          <div style={styles.handle} />
          <div style={styles.titleRow}>
            <span style={styles.eyebrow}>— ROLL {rollLabel} 완성 —</span>
            <button style={styles.closeBtn} onClick={handleClose} aria-label="닫기">
              <X size={14} />
            </button>
          </div>
          <p style={styles.subtitle}>이 롤의 이름을 붙여주세요</p>
        </div>

        {/* 본문 */}
        <div style={styles.body}>
          <input
            style={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.slice(0, 20))}
            placeholder={suggesting ? '생각 중...' : '봄이 왔던 롤'}
            disabled={suggesting}
            maxLength={20}
          />
          <div style={styles.inputMeta}>
            <span style={styles.charCount}>{inputValue.length} / 20</span>
          </div>

          <button
            style={{ ...styles.suggestBtn, opacity: suggesting ? 0.5 : 1 }}
            onClick={handleSuggest}
            disabled={suggesting}
          >
            {suggesting ? '✦ AI가 생각 중...' : '✦ AI 제안 받기'}
          </button>
        </div>

        {/* 푸터 */}
        <div style={styles.footer}>
          <button style={styles.btnSkip} onClick={handleClose}>
            건너뛰기
          </button>
          <button
            style={{
              ...styles.btnSave,
              ...(!inputValue.trim() || saving ? styles.btnSaveDisabled : {}),
            }}
            onClick={handleSave}
            disabled={!inputValue.trim() || saving}
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </OverlaySheet>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    flexShrink: 0,
    padding: '16px 20px 12px',
    borderBottom: '1px solid var(--border)',
  },
  handle: {
    width: 36,
    height: 3,
    background: 'var(--border-light)',
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.12em',
    opacity: 0.8,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--cream-muted)',
    padding: '4px',
    opacity: 0.6,
  },
  subtitle: {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13,
    color: 'var(--cream-muted)',
    fontWeight: 300,
    marginTop: 8,
    marginBottom: 0,
  },
  body: {
    padding: '20px 20px 8px',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-light)',
    borderRadius: 8,
    padding: '12px 14px',
    color: 'var(--cream)',
    fontFamily: "'Noto Serif KR', serif",
    fontSize: 16,
    fontWeight: 400,
    outline: 'none',
    boxSizing: 'border-box' as const,
    lineHeight: 1.4,
  },
  inputMeta: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCount: {
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: 'var(--cream-muted)',
    opacity: 0.5,
  },
  suggestBtn: {
    marginTop: 12,
    background: 'transparent',
    border: '1px solid var(--amber-35)',
    borderRadius: 6,
    padding: '10px 16px',
    cursor: 'pointer',
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: 'var(--amber)',
    letterSpacing: '0.08em',
    width: '100%',
    transition: 'opacity 0.2s',
  },
  footer: {
    flexShrink: 0,
    padding: '12px 20px 28px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    gap: 10,
  },
  btnSkip: {
    flex: 1,
    padding: 13,
    background: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--cream-muted)',
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: '0.06em',
  },
  btnSave: {
    flex: 2,
    padding: 13,
    background: 'linear-gradient(135deg, var(--amber-light), var(--amber))',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--bg)',
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    letterSpacing: '0.06em',
    fontWeight: 600,
    boxShadow: '0 3px 12px var(--amber-35)',
    transition: 'opacity 0.2s',
  },
  btnSaveDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
}
