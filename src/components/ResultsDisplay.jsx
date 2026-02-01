import React, { useEffect, useRef } from 'react'
import EnhancedInsightDisplay from './EnhancedInsightDisplay';
import ElementWheel from './ElementWheel';
import BaziChartGrid from './BaziChartGrid';
import AgePeriodsSection from './AgePeriodsSection';
import LifeDomainSummary from './LifeDomainSummary';
import SectionContent from './SectionContent';
import { SectionSkeleton } from './SkeletonCard';

/** Stable component - must be outside ResultsDisplay to prevent re-creation on each render (fixes section flashing) */
const SectionWithSkeleton = ({ content, loading, skeletonLines = 4, generatingLabel, failedLabel, sectionError, children }) => {
  if (content) {
    return <div className="animate-fade-in">{children}</div>
  }
  if (loading) {
    return <SectionSkeleton lines={skeletonLines} />
  }
  const displayMessage = sectionError || failedLabel || generatingLabel
  return <p className="text-sm text-rose-300/90 italic">{displayMessage}</p>
}

export const ResultsDisplay = ({ baziChart, insights, sectionContent = {}, sectionErrors = {}, language, loading = false }) => {
  const insightsRef = useRef(null)

  // Scroll to results when chart first appears
  useEffect(() => {
    if (baziChart) {
      const el = document.getElementById('results-content')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [baziChart])

  // Auto-scroll as new insights arrive
  useEffect(() => {
    if (insightsRef.current) {
      insightsRef.current.scrollTop = insightsRef.current.scrollHeight
    }
  }, [insights])


  if (!baziChart) return null


  const { four_pillars, day_master, elements, age_periods, strongest_ten_god, annual_luck, seasonal_strength, deities } = baziChart


  const titles = {
    en: {
      chart: 'Your BAZI Chart',
      pillars: 'Four Pillars',
      dayMaster: 'Day Master (Your Core)',
      elements: 'Five Elements Analysis',
      ageTimeline: 'Age-based Luck Timeline',
      insights: 'Comprehensive Insights',
      tenGods: 'Ten Gods (Shi Shen)',
      strongestTenGod: 'Strongest Ten God',
      annualLuck: 'Annual Luck',
      currentYear: 'Current Year',
      interactions: 'Interactions',
      seasonalStrength: 'Seasonal Strength',
      deities: 'Deities (神煞)'
    },
    'zh-TW': {
      chart: '您的八字命盤',
      pillars: '四柱',
      dayMaster: '日主（您的核心）',
      elements: '五行分析',
      ageTimeline: '人生大運時間軸',
      insights: '綜合分析',
      tenGods: '十神',
      strongestTenGod: '最突出十神',
      annualLuck: '流年',
      currentYear: '當前年份',
      interactions: '與命盤互動',
      seasonalStrength: '得令/失令',
      deities: '神煞'
    },
    'zh-CN': {
      chart: '您的八字命盘',
      pillars: '四柱',
      dayMaster: '日主（您的核心）',
      elements: '五行分析',
      ageTimeline: '人生大运时间轴',
      insights: '综合分析',
      tenGods: '十神',
      strongestTenGod: '最突出十神',
      annualLuck: '流年',
      currentYear: '当前年份',
      interactions: '与命盘互动',
      seasonalStrength: '得令/失令',
      deities: '神煞'
    },
    ko: {
      chart: '사주 명반',
      pillars: '사주',
      dayMaster: '일주 (핵심)',
      elements: '오행 분석',
      ageTimeline: '인생 대운 타임라인',
      insights: '종합 분석',
      tenGods: '십성',
      strongestTenGod: '가장 두드러진 십성',
      annualLuck: '유년',
      currentYear: '현재 연도',
      interactions: '명반과의 상호작용',
      seasonalStrength: '득령/실령',
      deities: '신살'
    }
  }


  const labels = titles[language] || titles.en

  const miscLabels = {
    appears: { en: 'appears', 'zh-TW': '出現', 'zh-CN': '出现', ko: '출현' },
    times: { en: 'times', 'zh-TW': '次', 'zh-CN': '次', ko: '회' },
    generating: { en: 'Generating...', 'zh-TW': '生成中...', 'zh-CN': '生成中...', ko: '생성 중...' },
    sectionFailed: { en: 'This section could not be generated. Please try again.', 'zh-TW': '此區塊無法生成，請再試一次。', 'zh-CN': '此区块无法生成，请再试一次。', ko: '이 섹션을 생성할 수 없습니다. 다시 시도해 주세요.' },
    insightsFailed: { en: 'Destiny Analysis could not be generated.', 'zh-TW': '綜合分析無法生成。', 'zh-CN': '综合分析无法生成。', ko: '운명 분석을 생성할 수 없습니다.' },
    forecast: { en: 'Forecast', 'zh-TW': '流年展望', 'zh-CN': '流年展望', ko: '연간 전망' },
    currentDecade: { en: 'Your Current Decade', 'zh-TW': '您目前的十年大運', 'zh-CN': '您目前的十年大运', ko: '현재 대운 (10년)' },
  }
  const getMisc = (key) => miscLabels[key][language] || miscLabels[key].en
  const generatingLabel = getMisc('generating')
  const sectionFailedLabel = getMisc('sectionFailed')
  const insightsFailedLabel = getMisc('insightsFailed')

  return (
    <div className="space-y-8">
      {/* BAZI Chart Card - fades in when chart loads */}
      <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card animate-fade-in" id="results-content">
        <h2 className="text-2xl font-semibold text-amber-100 mb-4 pb-3 border-b border-white/5 tracking-wide">
          {labels.chart}
        </h2>


        {/* Four Pillars - Traditional Bazi Chart Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-amber-200 mb-3">{labels.pillars}</h3>
          <BaziChartGrid four_pillars={four_pillars} language={language} />
        </div>


        {/* Day Master */}
        <div className="mb-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-amber-200 mb-2">{labels.dayMaster}</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-amber-50">{day_master.stem_cn}</p>
              <p className="text-neutral-400">{day_master.element} ({day_master.yin_yang})</p>
            </div>
            <div className="text-4xl">☯︎</div>
          </div>
        </div>


        {/* Elements */}
        <div className="rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-amber-200 mb-3">{labels.elements}</h3>
          {sectionContent.five_elements ? (
            <div className="animate-fade-in">
              <ElementWheel elements={elements} language={language} customAdvice={sectionContent.five_elements} />
            </div>
          ) : loading ? (
            <SectionSkeleton lines={3} />
          ) : (
            <p className="text-sm text-rose-300/90 italic">{sectionErrors.five_elements || sectionFailedLabel}</p>
          )}
        </div>

        {/* Ten Gods - Strongest */}
        {strongest_ten_god && strongest_ten_god.name_en && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-amber-200 mb-2">{labels.tenGods}</h3>
            <p className="text-amber-50 mb-3">
              <span className="font-semibold text-amber-200">{labels.strongestTenGod}: </span>
              {strongest_ten_god.name_en} ({strongest_ten_god.name_cn})
              {strongest_ten_god.count != null && (
                <span className="text-neutral-400"> — {getMisc('appears')} {strongest_ten_god.count} {getMisc('times')}</span>
              )}
            </p>
            <SectionWithSkeleton content={sectionContent.ten_gods} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.ten_gods}>
              <SectionContent content={sectionContent.ten_gods} />
            </SectionWithSkeleton>
          </div>
        )}

        {/* Seasonal Strength */}
        {seasonal_strength && seasonal_strength.strength && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-amber-200 mb-2">{labels.seasonalStrength}</h3>
            <SectionWithSkeleton content={sectionContent.seasonal_strength} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.seasonal_strength}>
              <SectionContent content={sectionContent.seasonal_strength} />
            </SectionWithSkeleton>
          </div>
        )}

        {/* Deities */}
        {deities && deities.length > 0 && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-amber-200 mb-2">{labels.deities}</h3>
            <ul className="space-y-2">
              {deities.map((d, idx) => (
                <li key={idx} className="text-sm text-amber-50">
                  <span className="font-semibold text-amber-200">{d.name_en} ({d.name_cn}): </span>
                  {language === 'en' && d.interpretation_en}
                  {language === 'zh-TW' && d.interpretation_zh_tw}
                  {language === 'zh-CN' && d.interpretation_zh_cn}
                  {language === 'ko' && (d.interpretation_ko || d.interpretation_en)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Annual Luck Card - Year Forecast */}
      {annual_luck && annual_luck.annual_pillar && (
        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-amber-100 tracking-wide mb-1">
            {annual_luck.annual_pillar.year} {getMisc('forecast')}
          </h2>
          <p className="text-sm text-amber-50 mb-4">
            {labels.currentYear}: {annual_luck.annual_pillar.stem?.name_cn}{annual_luck.annual_pillar.branch?.name_cn}
            {annual_luck.annual_pillar.stem?.element && ` (${annual_luck.annual_pillar.stem.element} ${annual_luck.annual_pillar.branch?.zodiac || ''})`}
          </p>
          {annual_luck.interactions && annual_luck.interactions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold text-amber-200 mb-2">{labels.interactions}</h3>
              <ul className="space-y-2">
                {annual_luck.interactions.map((int, idx) => (
                  <li key={idx} className={`text-sm ${int.type === 'Clash' ? 'text-rose-200' : 'text-emerald-200'}`}>
                    <span className="font-medium">{int.type === 'Clash' ? '⚠️ ' : '✓ '}{int.type}: </span>
                    {int.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {sectionContent.annual_forecast ? (
            <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
              <SectionContent content={sectionContent.annual_forecast} />
            </div>
          ) : loading ? (
            <div className="mt-4 pt-4 border-t border-white/5">
              <SectionSkeleton lines={4} />
            </div>
          ) : (
            <p className="mt-4 pt-4 border-t border-white/5 text-sm text-rose-300/90 italic">
              {sectionErrors.annual_forecast || sectionFailedLabel}
            </p>
          )}
        </div>
      )}

      {/* Current Age Period - Your Current Decade */}
      {age_periods && age_periods.length > 0 && (() => {
        const birthDateStr = baziChart?.input?.birth_date
        const birthYear = birthDateStr ? parseInt(birthDateStr.slice(0, 4), 10) : null
        const currentAge = birthYear != null ? new Date().getFullYear() - birthYear : null
        let currentPeriod = null
        if (currentAge != null) {
          for (const p of age_periods) {
            if (p.start_age <= currentAge && currentAge < p.end_age) {
              currentPeriod = p
              break
            }
          }
        }
        if (!currentPeriod) currentPeriod = age_periods[0]
        const periodLabelMap = {
          en: currentPeriod ? `Ages ${currentPeriod.start_age}–${currentPeriod.end_age}` : '',
          'zh-TW': currentPeriod ? `${currentPeriod.start_age}–${currentPeriod.end_age}歲` : '',
          'zh-CN': currentPeriod ? `${currentPeriod.start_age}–${currentPeriod.end_age}岁` : '',
          ko: currentPeriod ? `나이 ${currentPeriod.start_age}–${currentPeriod.end_age}세` : '',
        }
        const periodLabel = periodLabelMap[language] || periodLabelMap.en
        return (
          <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-amber-100 tracking-wide mb-2">
              {getMisc('currentDecade')}
            </h2>
            <p className="text-sm text-amber-200 mb-3">
              {periodLabel}
            </p>
            <SectionWithSkeleton content={sectionContent.current_age_period} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.current_age_period}>
              <SectionContent content={sectionContent.current_age_period} />
            </SectionWithSkeleton>
          </div>
        )
      })()}

      {/* Life domain summary, then Age-based Luck Periods */}
      {age_periods && age_periods.length > 0 && (
        <>
          <LifeDomainSummary agePeriods={age_periods} language={language} />
          <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-2xl font-semibold text-amber-100 tracking-wide">
                {labels.ageTimeline}
              </h2>
            </div>
            {sectionContent.age_periods_timeline ? (
              <div className="animate-fade-in">
                <AgePeriodsSection
                  agePeriods={age_periods}
                  language={language}
                  agePeriodsAiContent={sectionContent.age_periods_timeline}
                  currentAge={
                    baziChart?.input?.birth_date
                      ? new Date().getFullYear() - parseInt(baziChart.input.birth_date.slice(0, 4), 10)
                      : null
                  }
                />
              </div>
            ) : loading ? (
              <SectionSkeleton lines={6} />
            ) : (
              <p className="text-sm text-rose-300/90 italic">{sectionErrors.age_periods_timeline || sectionFailedLabel}</p>
            )}
          </div>
        </>
      )}


      {/* Insights Card - skeleton when loading, failure when complete but empty */}
      {insights ? (
        <div className="animate-fade-in">
          <EnhancedInsightDisplay insights={insights} language={language} />
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card animate-pulse">
          <div className="h-6 bg-neutral-800 rounded w-1/3 mb-4" />
          <SectionSkeleton lines={6} />
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card">
          <p className="text-sm text-rose-300/90 italic">{insightsFailedLabel}</p>
        </div>
      )}
    </div>
  )
}


export default ResultsDisplay
