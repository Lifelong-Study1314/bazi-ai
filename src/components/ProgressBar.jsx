import React from 'react'

export const ProgressBar = ({ progress, loading, language, sectionsCompleted = 0, totalSections = 8 }) => {
  if (!loading) return null

  const rounded = Math.round(progress)
  const completed = Math.min(sectionsCompleted, totalSections)

  const sectionMsg = {
    en: `Section ${completed} of ${totalSections} complete`,
    'zh-TW': `已完成 ${completed}/${totalSections} 個分析板塊`,
    'zh-CN': `已完成 ${completed}/${totalSections} 个分析板块`,
    ko: `분석 섹션 ${completed}/${totalSections} 완료`
  }

  const mainMsg = {
    en: 'Analysis generating...',
    'zh-TW': '八字分析中...',
    'zh-CN': '八字分析中...',
    ko: '사주 분석 중...'
  }

  return (
    <div className="w-full mb-6 animate-fade-in" role="progressbar" aria-valuenow={rounded} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress">
      <div className="mb-3">
        <p className="text-amber-100 font-semibold text-center">
          {mainMsg[language] || mainMsg.en}
        </p>
        <p className="text-amber-200/90 text-sm text-center mt-1">
          {sectionMsg[language] || sectionMsg.en}
        </p>
      </div>
      
      <div className="relative w-full bg-neutral-800 rounded-full h-3 overflow-hidden border border-bazi-gold/40">
        <div
          className="h-full bg-gradient-to-r from-bazi-gold via-amber-400 to-amber-200 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${rounded}%` }}
        >
          <div className="h-full bg-white/20 opacity-70 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
