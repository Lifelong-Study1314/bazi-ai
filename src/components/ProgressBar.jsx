import React, { useState, useEffect } from 'react'

const SECTION_LABELS = {
  en: [
    'Calculating your chart...',
    'Analyzing Five Elements...',
    'Reading Ten Gods...',
    'Evaluating Seasonal Strength...',
    'Determining Use God & Avoid God...',
    'Analyzing Pillar Interactions...',
    'Forecasting your year ahead...',
    'Examining your current decade...',
    'Mapping your life timeline...',
    'Composing destiny insights...',
  ],
  'zh-TW': [
    '計算命盤中...',
    '分析五行...',
    '解讀十神...',
    '評估得令狀態...',
    '推算用神忌神...',
    '分析合沖刑害...',
    '預測流年運勢...',
    '解析當前大運...',
    '繪製人生大運圖...',
    '撰寫綜合分析...',
  ],
  'zh-CN': [
    '计算命盘中...',
    '分析五行...',
    '解读十神...',
    '评估得令状态...',
    '推算用神忌神...',
    '分析合冲刑害...',
    '预测流年运势...',
    '解析当前大运...',
    '绘制人生大运图...',
    '撰写综合分析...',
  ],
  ko: [
    '명반 계산 중...',
    '오행 분석 중...',
    '십성 해석 중...',
    '득령 평가 중...',
    '용신/기신 판별 중...',
    '합충형해 분석 중...',
    '유년 운세 예측 중...',
    '현재 대운 분석 중...',
    '인생 대운 타임라인 작성 중...',
    '종합 분석 작성 중...',
  ],
}

const SLOW_THRESHOLD_MS = 60_000 // 60 seconds before showing "taking longer" hint

const SLOW_MSG = {
  en: 'AI analysis is taking longer than usual. Please be patient...',
  'zh-TW': 'AI 分析耗時較長，請耐心等待...',
  'zh-CN': 'AI 分析耗时较长，请耐心等待...',
  ko: 'AI 분석이 평소보다 오래 걸리고 있습니다. 잠시만 기다려 주세요...',
}

export const ProgressBar = ({ progress, loading, language, sectionsCompleted = 0, totalSections = 8 }) => {
  const [showSlowHint, setShowSlowHint] = useState(false)

  useEffect(() => {
    if (!loading) {
      setShowSlowHint(false)
      return
    }
    const timer = setTimeout(() => setShowSlowHint(true), SLOW_THRESHOLD_MS)
    return () => clearTimeout(timer)
  }, [loading])

  if (!loading) return null

  const rounded = Math.round(progress)
  const completed = Math.min(sectionsCompleted, totalSections)

  const labels = SECTION_LABELS[language] || SECTION_LABELS.en
  const currentLabel = labels[Math.min(completed, labels.length - 1)]

  const sectionMsg = {
    en: `Section ${completed} of ${totalSections} complete`,
    'zh-TW': `已完成 ${completed}/${totalSections} 個分析板塊`,
    'zh-CN': `已完成 ${completed}/${totalSections} 个分析板块`,
    ko: `분석 섹션 ${completed}/${totalSections} 완료`,
  }

  return (
    <div id="analysis-progress" className="w-full mb-6 animate-fade-in" role="progressbar" aria-valuenow={rounded} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress">
      <div className="mb-3">
        {/* Active section name */}
        <p className="text-amber-100 font-semibold text-center text-lg animate-fade-in" key={completed}>
          {currentLabel}
        </p>
        <p className="text-amber-200/90 text-sm text-center mt-1">
          {sectionMsg[language] || sectionMsg.en}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative w-full bg-neutral-800 rounded-full h-3 overflow-hidden border border-bazi-gold/40">
        <div
          className="h-full bg-gradient-to-r from-bazi-gold via-amber-400 to-amber-200 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${rounded}%` }}
        >
          <div className="h-full animate-shimmer"></div>
        </div>
      </div>

      {/* Section dots */}
      <div className="flex justify-center gap-2 mt-3">
        {Array.from({ length: totalSections }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < completed
                ? 'bg-bazi-gold scale-100'
                : i === completed
                  ? 'bg-amber-400/60 scale-110 animate-pulse'
                  : 'bg-neutral-700 scale-75'
            }`}
          />
        ))}
      </div>

      {/* Slow analysis hint */}
      {showSlowHint && (
        <p className="text-amber-300/70 text-xs text-center mt-3 animate-fade-in">
          {SLOW_MSG[language] || SLOW_MSG.en}
        </p>
      )}
    </div>
  )
}

export default ProgressBar
