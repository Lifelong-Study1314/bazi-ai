import React from 'react'
import SectionContent from './SectionContent'

const qualityLabels = {
  very_auspicious: {
    en: 'Very Auspicious',
    'zh-TW': '大吉運',
    'zh-CN': '大吉运',
    ko: '대길운',
  },
  auspicious: {
    en: 'Auspicious',
    'zh-TW': '吉運',
    'zh-CN': '吉运',
    ko: '길운',
  },
  neutral: {
    en: 'Neutral',
    'zh-TW': '平運',
    'zh-CN': '平运',
    ko: '평운',
  },
  challenging: {
    en: 'Challenging',
    'zh-TW': '挑戰期',
    'zh-CN': '挑战期',
    ko: '도전기',
  },
  very_challenging: {
    en: 'Very Challenging',
    'zh-TW': '大挑戰期',
    'zh-CN': '大挑战期',
    ko: '대도전기',
  },
}

const getQualityLabel = (quality, language) => {
  const labels = qualityLabels[quality] || qualityLabels.neutral
  return labels[language] || labels.en
}

// Phase labels: Early Life (8-27), Prime Years (28-47), Harvest Years (48-67), Wisdom Years (68-87)
const phaseLabels = {
  early: { en: 'Early Life', 'zh-TW': '早年', 'zh-CN': '早年', ko: '초년' },
  prime: { en: 'Prime Years', 'zh-TW': '壯年', 'zh-CN': '壮年', ko: '장년' },
  harvest: { en: 'Harvest Years', 'zh-TW': '收成期', 'zh-CN': '收成期', ko: '수확기' },
  wisdom: { en: 'Wisdom Years', 'zh-TW': '智慧期', 'zh-CN': '智慧期', ko: '지혜기' },
}

const getPhaseForPeriod = (startAge) => {
  if (startAge < 28) return 'early'
  if (startAge < 48) return 'prime'
  if (startAge < 68) return 'harvest'
  return 'wisdom'
}

const AgePeriodsSection = ({
  agePeriods = [],
  language = 'en',
  agePeriodsAiContent = null,
  currentAge = null,
}) => {
  if (!agePeriods || agePeriods.length === 0) return null

  const titleMap = {
    en: 'Age-based Luck Timeline',
    'zh-TW': '人生大運時間軸',
    'zh-CN': '人生大运时间轴',
    ko: '연령별 대운 타임라인',
  }

  const subtitleMap = {
    en: 'Key 10-year luck cycles across your life.',
    'zh-TW': '從八歲起，每十年一個重要大運周期。',
    'zh-CN': '从八岁起，每十年一个重要大运周期。',
    ko: '8세부터 10년 단위의 대운 주기를 확인하세요.',
  }

  const journeyOverviewLabelMap = {
    en: 'Journey Overview',
    'zh-TW': '人生旅程總覽',
    'zh-CN': '人生旅程总览',
    ko: '인생 여정 개요',
  }
  const currentBadgeMap = { en: 'Current', 'zh-TW': '當前', 'zh-CN': '当前', ko: '현재' }
  const keyThemesMap = { en: 'Key themes', 'zh-TW': '核心主題', 'zh-CN': '核心主题', ko: '핵심 주제' }
  const focusDirectionMap = { en: 'What to lean into', 'zh-TW': '建議專注方向', 'zh-CN': '建议专注方向', ko: '집중 방향' }
  const cautionsMap = { en: 'Cautions', 'zh-TW': '注意事項', 'zh-CN': '注意事项', ko: '주의사항' }
  const agePeriodLabelMap = {
    en: (s, e) => `Age ${s}–${e}`,
    'zh-TW': (s, e) => `年齡 ${s}–${e} 歲`,
    'zh-CN': (s, e) => `年龄 ${s}–${e} 岁`,
    ko: (s, e) => `나이 ${s}–${e}세`,
  }

  const title = titleMap[language] || titleMap.en
  const subtitle = subtitleMap[language] || subtitleMap.en

  const displayPeriods = agePeriods.slice(0, 8)
  const journeyOverview = agePeriodsAiContent?.journey_overview || null

  return (
    <div className="mt-8 space-y-4">
      <div>
        <h3 className="text-base sm:text-xl font-semibold text-amber-200 tracking-wide">
          {title}
        </h3>
        <p className="text-[11px] sm:text-sm text-neutral-400 mt-1">
          {subtitle}
        </p>
      </div>

      {/* Journey Overview block - above timeline bar */}
      {journeyOverview && (
        <div className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-950/60 via-neutral-950 to-amber-950/60 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_0_25px_rgba(0,0,0,0.4)]">
          <p className="text-xs sm:text-sm font-semibold text-amber-200 mb-2 uppercase tracking-wide">
            {journeyOverviewLabelMap[language] || journeyOverviewLabelMap.en}
          </p>
          <SectionContent content={journeyOverview} className="text-xs sm:text-sm text-amber-100/90" />
        </div>
      )}

      {/* Timeline bar */}
      <div className="relative w-full min-h-[12px] sm:min-h-[14px] rounded-full bg-neutral-800 overflow-hidden border border-amber-700/40">
        <div className="absolute inset-0 flex">
          {displayPeriods.map((period, index) => {
            const quality = period.quality || 'neutral'
            const colors = {
              very_auspicious: 'bg-emerald-500/80',
              auspicious: 'bg-emerald-400/80',
              neutral: 'bg-amber-400/70',
              challenging: 'bg-rose-500/80',
              very_challenging: 'bg-rose-700/80',
            }
            const width = `${100 / displayPeriods.length}%`

            return (
              <div
                key={index}
                className={`${colors[quality] || colors.neutral} h-full min-w-[24px] border-r border-black/20 last:border-r-0`}
                style={{ width }}
              />
            )
          })}
        </div>
      </div>

      {/* Single-column narrative timeline with vertical connector */}
      <div className="relative flex flex-col">
        {/* Vertical timeline line - left border */}
        <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-px bg-amber-600/40" />

        {displayPeriods.map((period, index) => {
          const quality = period.quality || 'neutral'
          const label = getQualityLabel(quality, language)
          const stem = period.luck_pillar?.stem?.name_cn || ''
          const branch = period.luck_pillar?.branch?.name_cn || ''
          const startAge = period.start_age
          const endAge = period.end_age
          const periodKey = `age_${startAge}_${endAge}`
          const fallbackBlock = agePeriodsAiContent?.age_periods_timeline
          const aiContent =
            agePeriodsAiContent && typeof agePeriodsAiContent === 'object'
              ? agePeriodsAiContent[periodKey] ?? (index === 0 ? fallbackBlock : null)
              : null
          const summary = period.summary
          const themes = period.themes || []
          const focusAreas = period.focus_areas || []
          const cautions = period.cautions || []

          const phase = getPhaseForPeriod(startAge)
          const phaseLabel = phaseLabels[phase]?.[language] || phaseLabels[phase]?.en || phase
          const showPhaseLabel =
            index === 0 || getPhaseForPeriod(displayPeriods[index - 1].start_age) !== phase

          const isCurrentPeriod =
            currentAge != null && startAge <= currentAge && currentAge < endAge

          const badgeColors = {
            very_auspicious: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
            auspicious: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/60',
            neutral: 'bg-amber-400/10 text-amber-200 border-amber-300/60',
            challenging: 'bg-rose-500/15 text-rose-200 border-rose-400/60',
            very_challenging: 'bg-rose-700/20 text-rose-200 border-rose-500/70',
          }

          return (
            <div key={index} className="relative flex gap-0 pb-4 sm:pb-6">
              {/* Timeline node on connector */}
              <div className="relative z-10 shrink-0 w-6 sm:w-8 flex justify-center pt-1.5">
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    isCurrentPeriod ? 'bg-amber-400 ring-2 ring-amber-400/50' : 'bg-amber-600/70'
                  }`}
                />
              </div>

              {/* Period card */}
              <div className="flex-1 min-w-0 -ml-6 sm:-ml-8 pl-6 sm:pl-8">
                {showPhaseLabel && (
                  <p className="text-[10px] sm:text-xs font-semibold text-amber-400/90 uppercase tracking-wider mb-2">
                    {phaseLabel}
                  </p>
                )}
                <div
                  className={`relative rounded-xl border bg-gradient-to-br from-neutral-900/95 via-neutral-950 to-neutral-900/95 px-3 py-2 sm:px-4 sm:py-3 shadow-[0_0_25px_rgba(0,0,0,0.6)] transition-all duration-200 ${
                    isCurrentPeriod
                      ? 'border-amber-400/60 bg-amber-950/30 ring-1 ring-amber-400/30'
                      : 'border-amber-400/30 hover:border-amber-500/30 hover:shadow-lg'
                  }`}
                >
                  {/* Corner ornaments - hidden on mobile */}
                  <div className="pointer-events-none absolute inset-0 hidden sm:block">
                    <div className="absolute left-2 top-2 w-4 h-[1px] bg-amber-400/70" />
                    <div className="absolute left-2 top-2 h-4 w-[1px] bg-amber-400/70" />
                    <div className="absolute right-2 top-2 w-4 h-[1px] bg-amber-400/70" />
                    <div className="absolute right-2 top-2 h-4 w-[1px] bg-amber-400/70" />
                    <div className="absolute left-2 bottom-2 w-4 h-[1px] bg-amber-400/40" />
                    <div className="absolute left-2 bottom-2 h-4 w-[1px] bg-amber-400/40" />
                    <div className="absolute right-2 bottom-2 w-4 h-[1px] bg-amber-400/40" />
                    <div className="absolute right-2 bottom-2 h-4 w-[1px] bg-amber-400/40" />
                  </div>

                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs tracking-wide text-amber-300/80 uppercase">
                          {(agePeriodLabelMap[language] || agePeriodLabelMap.en)(startAge, endAge)}
                        </p>
                        {isCurrentPeriod && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 font-medium">
                            {currentBadgeMap[language] || currentBadgeMap.en}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-base sm:text-lg font-semibold text-amber-50">
                        {stem}
                        {branch}
                      </p>
                    </div>

                    <div
                      title={`${stem}${branch} — ${label}`}
                      className={`px-2 py-1 rounded-full border text-xs font-medium shrink-0 ${
                        badgeColors[quality] || badgeColors.neutral
                      }`}
                    >
                      {label}
                    </div>
                  </div>

                  {/* Always-expanded content - narrative flow */}
                  <div className="mt-3 pt-3 border-t border-amber-400/30 space-y-2">
                    {aiContent ? (
                      <SectionContent content={aiContent} className="text-xs text-amber-100/90" />
                    ) : (
                      <>
                        {summary && (
                          <p className="text-xs text-amber-100/90">
                            {typeof summary === 'object'
                              ? summary[language] || summary.en || summary['zh-TW'] || summary['zh-CN']
                              : summary}
                          </p>
                        )}

                        {themes.length > 0 && (
                          <div className="text-xs text-amber-200/90">
                            <p className="font-semibold mb-1">
                              {keyThemesMap[language] || keyThemesMap.en}
                            </p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {themes.slice(0, 2).map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {focusAreas.length > 0 && (
                          <div className="text-xs text-emerald-200/90">
                            <p className="font-semibold mb-1">
                              {focusDirectionMap[language] || focusDirectionMap.en}
                            </p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {focusAreas.slice(0, 3).map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {cautions.length > 0 && (
                          <div className="text-xs text-rose-200/90">
                            <p className="font-semibold mb-1">
                              {cautionsMap[language] || cautionsMap.en}
                            </p>
                            <ul className="list-disc list-inside space-y-0.5">
                              {cautions.slice(0, 2).map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AgePeriodsSection
