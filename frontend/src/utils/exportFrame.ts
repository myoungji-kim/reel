import html2canvas from 'html2canvas'

export async function exportFrameAsImage(element: HTMLElement, filename: string): Promise<void> {
  // 캡처 제외 요소 임시 숨김
  const excludedEls = Array.from(element.querySelectorAll<HTMLElement>('[data-export-exclude]'))
  const prevVisibility = excludedEls.map((el) => el.style.visibility)
  excludedEls.forEach((el) => { el.style.visibility = 'hidden' })

  // 스크롤/overflow 보정
  const prevOverflow = element.style.overflow
  const prevMaxHeight = element.style.maxHeight
  const prevScrollTop = element.scrollTop
  element.style.overflow = 'visible'
  element.style.maxHeight = 'none'
  element.scrollTop = 0

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0f0c08',
    })

    // 워터마크 — 우하단 REEL 텍스트
    const ctx = canvas.getContext('2d')!
    ctx.font = 'bold 24px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText('REEL', canvas.width - 16, canvas.height - 16)

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('blob 생성 실패'))),
        'image/png',
      ),
    )

    const file = new File([blob], `${filename}.png`, { type: 'image/png' })

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } finally {
    excludedEls.forEach((el, i) => { el.style.visibility = prevVisibility[i] })
    element.style.overflow = prevOverflow
    element.style.maxHeight = prevMaxHeight
    element.scrollTop = prevScrollTop
  }
}
