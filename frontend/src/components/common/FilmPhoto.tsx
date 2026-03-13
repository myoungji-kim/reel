import { useState } from 'react'

interface Props {
  src: string
  alt?: string
  style?: React.CSSProperties
}

/** 이미지 로드 실패 시 "노출되지 않은 필름 프레임" 플레이스홀더를 표시 */
export default function FilmPhoto({ src, alt, style }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        style={{
          ...style,
          background: 'linear-gradient(145deg, #0d0a06, #181410)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* 조리개 아이콘 — 노출되지 않은 필름 메타포 */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.5" stroke="#9a8a70" strokeWidth="0.75" strokeOpacity="0.25" />
          <circle cx="8" cy="8" r="3.5" stroke="#9a8a70" strokeWidth="0.75" strokeOpacity="0.25" />
          <circle cx="8" cy="8" r="1.2" fill="#9a8a70" fillOpacity="0.18" />
          <line x1="8" y1="1.5" x2="8" y2="4" stroke="#9a8a70" strokeWidth="0.75" strokeOpacity="0.2" />
          <line x1="8" y1="12" x2="8" y2="14.5" stroke="#9a8a70" strokeWidth="0.75" strokeOpacity="0.2" />
          <line x1="1.5" y1="8" x2="4" y2="8" stroke="#9a8a70" strokeWidth="0.75" strokeOpacity="0.2" />
          <line x1="12" y1="8" x2="14.5" y2="8" stroke="#9a8a70" strokeWidth="0.75" strokeOpacity="0.2" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={() => setFailed(true)}
    />
  )
}
