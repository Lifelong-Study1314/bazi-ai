import React from 'react'

const domainLabels = {
  career: {
    en: 'Career',
    'zh-TW': '事業',
    'zh-CN': '事业',
    ko: '직업',
  },
  wealth: {
    en: 'Wealth',
    'zh-TW': '財富',
    'zh-CN': '财富',
    ko: '재물',
  },
  relationships: {
    en: 'Relationships',
    'zh-TW': '關係',
    'zh-CN': '关系',
    ko: '관계',
  },
  health: {
    en: 'Health',
    'zh-TW': '健康',
    'zh-CN': '健康',
    ko: '건강',
  },
  learning: {
    en: 'Learning / Inner Work',
    'zh-TW': '學習／內在修行',
    'zh-CN': '学习／内在修行',
    ko: '학습／내적 수양',
  },
}

const LifeDomainSummary = ({ agePeriods = [], language = 'en' }) => {
  if (!agePeriods || agePeriods.length === 0) return null

  const totals = {
    career: 0,
    wealth: 0,
    relationships: 0,
    health: 0,
    learning: 0,
  }

  agePeriods.forEach((p) => {
    const d = p.domains || {}
    Object.keys(totals).forEach((key) => {
      totals[key] += d[key] || 0
    })
  })

  const maxScore = Math.max(...Object.values(totals).map((v) => v || 0), 1)

  const titleMap = {
    en: 'Life Domain Emphasis Overview',
    'zh-TW': '人生領域整體側重',
    'zh-CN': '人生领域整体侧重',
  }

  const subtitleMap = {
    en: 'Which areas your chart emphasizes across all decades.',
    'zh-TW': '觀察一生中哪些面向較為突出或需要特別經營。',
    'zh-CN': '观察一生中哪些面向较为突出或需要特别经营。',
  }

  const title = titleMap[language] || titleMap.en
  const subtitle = subtitleMap[language] || subtitleMap.en

  return (
    <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card">
      <h2 className="text-2xl font-semibold text-amber-100 tracking-wide mb-1">
        {title}
      </h2>
      <p className="text-xs text-neutral-400 mb-4">{subtitle}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {Object.entries(totals).map(([key, value]) => {
          const label = domainLabels[key]?.[language] || domainLabels[key]?.en || key
          const ratio = value / maxScore
          const percent = Math.max(8, Math.round(ratio * 100))

          return (
            <div
              key={key}
              title={`${label}: ${percent}% emphasis`}
              className="flex flex-col items-stretch rounded-xl bg-bazi-surface/80 border border-white/5 px-3 py-2 hover:border-amber-500/20 hover:opacity-90 transition-all duration-200"
            >
              <p className="text-[11px] sm:text-xs font-semibold text-amber-200 mb-1 text-center">
                {label}
              </p>
              <div className="relative h-2 w-full rounded-full bg-neutral-800 overflow-hidden mb-1">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-bazi-gold via-amber-300 to-amber-100"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-300/80 text-center">
                {({ en: 'Emphasis', 'zh-TW': '側重程度', 'zh-CN': '侧重程度', ko: '강조도' }[language] || 'Emphasis')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LifeDomainSummary

