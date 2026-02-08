import html2canvas from 'html2canvas'

/**
 * Generate a PNG blob from a DOM element (ShareCard).
 * Uses scale:2 for crisp high-resolution output.
 */
export async function generateShareImage(cardElement) {
  const canvas = await html2canvas(cardElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#050505',
    logging: false,
  })
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png',
      1.0,
    )
  })
}

/**
 * Trigger a browser download of an image blob.
 */
export function downloadImage(blob, filename = 'BAZI_Report.png') {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Build localized share text.
 */
export function buildShareText(baziChart, language = 'en') {
  const dayMaster = baziChart?.day_master?.element || ''
  const useGod = baziChart?.use_god?.use_god?.element || ''
  const labels = {
    en: { title: 'My BAZI Analysis', dm: 'Day Master', ug: 'Use God' },
    'zh-TW': { title: '我的八字分析', dm: '日主', ug: '用神' },
    'zh-CN': { title: '我的八字分析', dm: '日主', ug: '用神' },
    ko: { title: '나의 사주 분석', dm: '일주', ug: '용신' },
  }
  const L = labels[language] || labels.en
  return `${L.title}\n${L.dm}: ${dayMaster}\n${L.ug}: ${useGod}`
}

/**
 * Attempt to share via Web Share API; falls back to download.
 */
export async function shareImage(blob, baziChart, language = 'en') {
  const text = buildShareText(baziChart, language)
  const file = new File([blob], 'BAZI_Report.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ text, files: [file] })
      return { success: true, method: 'native' }
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, method: 'aborted' }
    }
  }

  // Fallback: download
  downloadImage(blob)
  return { success: true, method: 'download' }
}
