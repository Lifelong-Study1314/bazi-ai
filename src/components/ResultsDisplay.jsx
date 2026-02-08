import React, { useEffect, useRef } from 'react'
import EnhancedInsightDisplay from './EnhancedInsightDisplay';
import ElementWheel from './ElementWheel';
import BaziChartGrid from './BaziChartGrid';
import AgePeriodsSection from './AgePeriodsSection';
import LifeDomainSummary from './LifeDomainSummary';
import PillarInteractions from './PillarInteractions';
import SectionContent from './SectionContent';
import LockedOverlay from './LockedOverlay';
import ShareCard from './ShareCard';
import ExportShareBar from './ExportShareBar';
import ErrorBoundary from './ErrorBoundary';
import { SectionSkeleton } from './SkeletonCard';
import { localizeElement, localizeYinYang, localizeZodiac, localizeStrength, localizeNamePair, localizeInteractionType } from '../utils/localize';

/** Stable component - must be outside ResultsDisplay to prevent re-creation on each render (fixes section flashing) */
const SectionWithSkeleton = ({ content, loading, skeletonLines = 4, generatingLabel, failedLabel, sectionError, retryLabel, onRetry, children }) => {
  if (content) {
    return <div className="animate-fade-in">{children}</div>
  }
  if (loading) {
    return <SectionSkeleton lines={skeletonLines} />
  }
  const displayMessage = sectionError || failedLabel || generatingLabel
  return (
    <div className="space-y-2">
      <p className="text-sm text-rose-300/90 italic">{displayMessage}</p>
      {onRetry && !loading && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-200 hover:bg-rose-900/30 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {retryLabel || 'Retry'}
        </button>
      )}
    </div>
  )
}

export const ResultsDisplay = ({ baziChart, insights, insightsLocked = false, sectionContent = {}, sectionLocked = {}, sectionErrors = {}, language, loading = false, isAuthenticated = false, isPremium = false, onUpgradeClick, onRetry, analysisComplete = false }) => {
  const insightsRef = useRef(null)
  const shareCardRef = useRef(null)

  // Scroll to progress bar (or results) when chart first appears
  useEffect(() => {
    if (baziChart) {
      // Prefer scrolling to the progress bar so the user sees the live analysis
      const progress = document.getElementById('analysis-progress')
      const target = progress || document.getElementById('results-content')
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [baziChart])

  // Auto-scroll as new insights arrive
  useEffect(() => {
    if (insightsRef.current) {
      insightsRef.current.scrollTop = insightsRef.current.scrollHeight
    }
  }, [insights])


  if (!baziChart) return null


  const { four_pillars, day_master, elements, age_periods, strongest_ten_god, annual_luck, seasonal_strength, deities, use_god, pillar_interactions } = baziChart


  const titles = {
    en: {
      chart: 'Your BAZI Chart',
      pillars: 'Four Pillars',
      dayMaster: 'Day Master (Your Core)',
      elements: 'Five Elements Analysis',
      ageTimeline: 'Age-based Luck Timeline',
      insights: 'Comprehensive Insights',
      tenGods: 'Ten Gods',
      strongestTenGod: 'Strongest Ten God',
      annualLuck: 'Annual Luck',
      currentYear: 'Current Year',
      interactions: 'Interactions',
      seasonalStrength: 'Seasonal Strength',
      deities: 'Deities',
      pillarInteractions: 'Pillar Interactions',
      useGod: 'Use God / Avoid God',
      useGodLabel: 'Use God (Favorable)',
      avoidGodLabel: 'Avoid God (Unfavorable)',
      dmStrength: 'Day Master Strength',
      secondaryLabel: 'Secondary',
      colorsLabel: 'Lucky Colors',
      directionsLabel: 'Favorable Direction',
      seasonsLabel: 'Best Season',
      careersLabel: 'Suitable Industries',
      numbersLabel: 'Lucky Numbers',
    },
    'zh-TW': {
      chart: '您的八字命盤',
      pillarInteractions: '命局合沖刑害',
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
      deities: '神煞',
      useGod: '用神 / 忌神',
      useGodLabel: '用神（有利）',
      avoidGodLabel: '忌神（不利）',
      dmStrength: '日主強弱',
      secondaryLabel: '輔助',
      colorsLabel: '幸運顏色',
      directionsLabel: '有利方位',
      seasonsLabel: '最佳季節',
      careersLabel: '適合行業',
      numbersLabel: '幸運數字',
    },
    'zh-CN': {
      chart: '您的八字命盘',
      pillarInteractions: '命局合冲刑害',
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
      deities: '神煞',
      useGod: '用神 / 忌神',
      useGodLabel: '用神（有利）',
      avoidGodLabel: '忌神（不利）',
      dmStrength: '日主强弱',
      secondaryLabel: '辅助',
      colorsLabel: '幸运颜色',
      directionsLabel: '有利方位',
      seasonsLabel: '最佳季节',
      careersLabel: '适合行业',
      numbersLabel: '幸运数字',
    },
    ko: {
      chart: '사주 명반',
      pillarInteractions: '명국 합충형해(合沖刑害)',
      pillars: '사주',
      dayMaster: '일주 (핵심)',
      elements: '오행 분석',
      ageTimeline: '인생 대운 타임라인',
      insights: '종합 분석',
      tenGods: '십성(十神)',
      strongestTenGod: '가장 두드러진 십성',
      annualLuck: '유년',
      currentYear: '현재 연도',
      interactions: '명반과의 상호작용',
      seasonalStrength: '득령/실령',
      deities: '신살(神煞)',
      useGod: '용신/기신(用神/忌神)',
      useGodLabel: '용신 (유리)',
      avoidGodLabel: '기신 (불리)',
      dmStrength: '일주 강약',
      secondaryLabel: '보조',
      colorsLabel: '행운의 색상',
      directionsLabel: '유리한 방위',
      seasonsLabel: '최적의 계절',
      careersLabel: '적합 업종',
      numbersLabel: '행운의 숫자',
    }
  }


  const labels = titles[language] || titles.en

  const miscLabels = {
    appears: { en: 'appears', 'zh-TW': '出現', 'zh-CN': '出现', ko: '출현' },
    times: { en: 'times', 'zh-TW': '次', 'zh-CN': '次', ko: '회' },
    generating: { en: 'Generating...', 'zh-TW': '生成中...', 'zh-CN': '生成中...', ko: '생성 중...' },
    sectionFailed: { en: 'This section could not be generated.', 'zh-TW': '此區塊無法生成。', 'zh-CN': '此区块无法生成。', ko: '이 섹션을 생성할 수 없습니다.' },
    retry: { en: 'Retry Analysis', 'zh-TW': '重新分析', 'zh-CN': '重新分析', ko: '분석 재시도' },
    insightsFailed: { en: 'Destiny Analysis could not be generated.', 'zh-TW': '綜合分析無法生成。', 'zh-CN': '综合分析无法生成。', ko: '운명 분석을 생성할 수 없습니다.' },
    forecast: { en: 'Forecast', 'zh-TW': '流年展望', 'zh-CN': '流年展望', ko: '연간 전망' },
    currentDecade: { en: 'Your Current Decade', 'zh-TW': '您目前的十年大運', 'zh-CN': '您目前的十年大运', ko: '현재 대운 (10년)' },
  }
  const getMisc = (key) => miscLabels[key][language] || miscLabels[key].en
  const generatingLabel = getMisc('generating')
  const sectionFailedLabel = getMisc('sectionFailed')
  const insightsFailedLabel = getMisc('insightsFailed')
  const retryLabel = getMisc('retry')

  return (
    <div className="space-y-8">
      {/* BAZI Chart Card - fades in when chart loads */}
      <ErrorBoundary language={language} label={labels.chart}>
      <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card animate-reveal-up" id="results-content">
        <h2 className="text-2xl font-semibold text-amber-100 mb-4 pb-3 border-b border-white/5 tracking-wide">
          {labels.chart}
        </h2>

        {/* Lunar-to-Solar conversion banner */}
        {baziChart?.input?.calendar_type === 'lunar' && baziChart?.input?.lunar_date && baziChart?.input?.solar_date && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-950/30 px-4 py-3 text-sm animate-fade-in">
            <span className="text-lg text-bazi-gold">☽</span>
            <span className="text-amber-200">
              {language === 'en' && `Lunar ${baziChart.input.lunar_date}${baziChart.input.is_leap_month ? ' (leap month)' : ''} = Solar ${baziChart.input.solar_date}`}
              {language === 'zh-TW' && `農曆 ${baziChart.input.lunar_date}${baziChart.input.is_leap_month ? '（閏月）' : ''} = 國曆 ${baziChart.input.solar_date}`}
              {language === 'zh-CN' && `农历 ${baziChart.input.lunar_date}${baziChart.input.is_leap_month ? '（闰月）' : ''} = 公历 ${baziChart.input.solar_date}`}
              {language === 'ko' && `음력 ${baziChart.input.lunar_date}${baziChart.input.is_leap_month ? ' (윤달)' : ''} = 양력 ${baziChart.input.solar_date}`}
            </span>
          </div>
        )}

        {/* Four Pillars - Traditional Bazi Chart Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-amber-200 mb-3 animate-fade-in">{labels.pillars}</h3>
          <BaziChartGrid four_pillars={four_pillars} language={language} />
        </div>


        {/* Day Master */}
        <div className="mb-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-reveal-up" style={{ animationDelay: '900ms' }}>
          <h3 className="text-lg font-semibold text-amber-200 mb-2">{labels.dayMaster}</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-amber-50">{day_master.stem_cn}</p>
              <p className="text-neutral-400">{localizeElement(day_master.element, language)} ({localizeYinYang(day_master.yin_yang, language)})</p>
            </div>
            <div className="text-4xl text-bazi-gold animate-pulse">☯</div>
          </div>
        </div>


        {/* Elements */}
        <div className="rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-section-slide" style={{ animationDelay: '1100ms' }}>
          <h3 className="text-lg font-semibold text-amber-200 mb-3">{labels.elements}</h3>
          {sectionContent.five_elements ? (
            <div className="animate-fade-in">
              <ElementWheel elements={elements} language={language} customAdvice={sectionContent.five_elements} />
            </div>
          ) : loading ? (
            <SectionSkeleton lines={3} />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-rose-300/90 italic">{sectionErrors.five_elements || sectionFailedLabel}</p>
              {onRetry && (
                <button onClick={onRetry} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-200 hover:bg-rose-900/30 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                  {retryLabel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ten Gods - Strongest */}
        {strongest_ten_god && strongest_ten_god.name_en && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-section-slide" style={{ animationDelay: '1300ms' }}>
            <h3 className="text-lg font-semibold text-amber-200 mb-3">{labels.tenGods}</h3>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-bazi-surface/50 border border-bazi-gold/15">
              <div className="w-10 h-10 rounded-full bg-bazi-gold/10 border border-bazi-gold/30 flex items-center justify-center text-bazi-gold font-bold text-lg shrink-0" style={{ fontFamily: 'serif' }}>
                {strongest_ten_god.name_cn?.charAt(0) || '神'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-100">
                  {localizeNamePair(strongest_ten_god.name_en, strongest_ten_god.name_cn, language)}
                </p>
                {strongest_ten_god.count != null && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {labels.strongestTenGod} — {getMisc('appears')} <span className="text-amber-200 font-semibold">{strongest_ten_god.count}</span> {getMisc('times')}
                  </p>
                )}
              </div>
            </div>
            <SectionWithSkeleton content={sectionContent.ten_gods} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.ten_gods} retryLabel={retryLabel} onRetry={onRetry}>
              <LockedOverlay isLocked={sectionLocked.ten_gods} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
                <SectionContent content={sectionContent.ten_gods} />
              </LockedOverlay>
            </SectionWithSkeleton>
          </div>
        )}

        {/* Seasonal Strength */}
        {seasonal_strength && seasonal_strength.strength && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-section-slide" style={{ animationDelay: '1500ms' }}>
            <h3 className="text-lg font-semibold text-amber-200 mb-3">{labels.seasonalStrength}</h3>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-bazi-surface/50 border border-bazi-gold/15">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                seasonal_strength.strength === 'prosperous' || seasonal_strength.strength === 'strong'
                  ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                  : seasonal_strength.strength === 'weak' || seasonal_strength.strength === 'dead'
                    ? 'bg-rose-900/30 text-rose-300 border-rose-500/30'
                    : 'bg-amber-900/30 text-amber-300 border-amber-500/30'
              }`}>
                {localizeStrength(seasonal_strength.strength, language)}
              </span>
              <p className="text-xs text-neutral-400 flex-1">
                {language === 'zh-TW' && seasonal_strength.explanation_zh_tw}
                {language === 'zh-CN' && seasonal_strength.explanation_zh_cn}
                {language === 'ko' && (seasonal_strength.explanation_ko || seasonal_strength.explanation_en)}
                {language === 'en' && seasonal_strength.explanation_en}
              </p>
            </div>
            <SectionWithSkeleton content={sectionContent.seasonal_strength} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.seasonal_strength} retryLabel={retryLabel} onRetry={onRetry}>
              <LockedOverlay isLocked={sectionLocked.seasonal_strength} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
                <SectionContent content={sectionContent.seasonal_strength} />
              </LockedOverlay>
            </SectionWithSkeleton>
          </div>
        )}

        {/* Use God / Avoid God */}
        {use_god && use_god.use_god && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-section-slide" style={{ animationDelay: '1700ms' }}>
            <h3 className="text-lg font-semibold text-amber-200 mb-4">{labels.useGod}</h3>

            {/* DM Strength badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-neutral-400">{labels.dmStrength}:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                use_god.dm_strength === 'strong' ? 'bg-red-900/40 text-red-300 border border-red-500/30' :
                use_god.dm_strength === 'weak' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
                'bg-amber-900/40 text-amber-300 border border-amber-500/30'
              }`}>
                {use_god.dm_strength === 'strong' ? (language === 'en' ? 'Strong' : language === 'zh-TW' ? '偏旺' : language === 'zh-CN' ? '偏旺' : '강(偏旺)') :
                 use_god.dm_strength === 'weak' ? (language === 'en' ? 'Weak' : language === 'zh-TW' ? '偏弱' : language === 'zh-CN' ? '偏弱' : '약(偏弱)') :
                 (language === 'en' ? 'Balanced' : language === 'zh-TW' ? '中和' : language === 'zh-CN' ? '中和' : '균형(中和)')}
              </span>
            </div>

            {/* Use God & Avoid God side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Use God card */}
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl text-emerald-400">▲</span>
                  <h4 className="text-sm font-semibold text-emerald-300">{labels.useGodLabel}</h4>
                </div>
                <p className="text-xl font-bold text-emerald-100 mb-1">{localizeElement(use_god.use_god, language)}</p>
                <p className="text-xs text-emerald-300/70">{labels.secondaryLabel}: {localizeElement(use_god.use_god_secondary, language)}</p>
              </div>

              {/* Avoid God card */}
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl text-rose-400">▼</span>
                  <h4 className="text-sm font-semibold text-rose-300">{labels.avoidGodLabel}</h4>
                </div>
                <p className="text-xl font-bold text-rose-100 mb-1">{localizeElement(use_god.avoid_god, language)}</p>
                <p className="text-xs text-rose-300/70">{labels.secondaryLabel}: {localizeElement(use_god.avoid_god_secondary, language)}</p>
              </div>
            </div>

            {/* Practical advice grid */}
            {use_god.advice && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {use_god.advice.colors && use_god.advice.colors[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en'] && (
                  <div className="rounded-lg bg-bazi-surface/60 p-3 border border-white/5">
                    <p className="text-xs text-neutral-500 mb-1">{labels.colorsLabel}</p>
                    <p className="text-sm text-amber-100">{use_god.advice.colors[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en']}</p>
                  </div>
                )}
                {use_god.advice.directions && use_god.advice.directions[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en'] && (
                  <div className="rounded-lg bg-bazi-surface/60 p-3 border border-white/5">
                    <p className="text-xs text-neutral-500 mb-1">{labels.directionsLabel}</p>
                    <p className="text-sm text-amber-100">{use_god.advice.directions[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en']}</p>
                  </div>
                )}
                {use_god.advice.seasons && use_god.advice.seasons[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en'] && (
                  <div className="rounded-lg bg-bazi-surface/60 p-3 border border-white/5">
                    <p className="text-xs text-neutral-500 mb-1">{labels.seasonsLabel}</p>
                    <p className="text-sm text-amber-100">{use_god.advice.seasons[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en']}</p>
                  </div>
                )}
                {use_god.advice.numbers && (
                  <div className="rounded-lg bg-bazi-surface/60 p-3 border border-white/5">
                    <p className="text-xs text-neutral-500 mb-1">{labels.numbersLabel}</p>
                    <p className="text-sm text-amber-100">{use_god.advice.numbers}</p>
                  </div>
                )}
                {use_god.advice.careers && use_god.advice.careers[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en'] && (
                  <div className="rounded-lg bg-bazi-surface/60 p-3 border border-white/5 col-span-2">
                    <p className="text-xs text-neutral-500 mb-1">{labels.careersLabel}</p>
                    <p className="text-sm text-amber-100">{use_god.advice.careers[language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : language === 'ko' ? 'ko' : 'en']}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI-generated personalized advice */}
            <SectionWithSkeleton content={sectionContent.use_god} loading={loading} skeletonLines={5} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.use_god} retryLabel={retryLabel} onRetry={onRetry}>
              <LockedOverlay isLocked={sectionLocked.use_god} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
                <SectionContent content={sectionContent.use_god} />
              </LockedOverlay>
            </SectionWithSkeleton>
          </div>
        )}

        {/* Pillar Interactions (合沖刑害) */}
        {pillar_interactions && pillar_interactions.summary && pillar_interactions.summary.total > 0 && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-section-slide" style={{ animationDelay: '1900ms' }}>
            <h3 className="text-lg font-semibold text-amber-200 mb-4">{labels.pillarInteractions}</h3>
            <PillarInteractions
              interactions={pillar_interactions}
              fourPillars={four_pillars}
              language={language}
            />
            <div className="mt-4">
              <SectionWithSkeleton content={sectionContent.pillar_interactions} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.pillar_interactions} retryLabel={retryLabel} onRetry={onRetry}>
                <LockedOverlay isLocked={sectionLocked.pillar_interactions} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
                  <SectionContent content={sectionContent.pillar_interactions} />
                </LockedOverlay>
              </SectionWithSkeleton>
            </div>
          </div>
        )}

        {/* Deities */}
        {deities && deities.length > 0 && (
          <div className="mt-6 rounded-xl border border-white/5 bg-bazi-surface/80 p-4 md:p-6 animate-section-slide" style={{ animationDelay: '2100ms' }}>
            <h3 className="text-lg font-semibold text-amber-200 mb-3">{labels.deities}</h3>
            <div className="space-y-2">
              {deities.map((d, idx) => (
                <div key={idx} className="flex gap-2.5 rounded-lg bg-bazi-surface/40 border border-white/5 px-3 py-2.5 text-sm">
                  <span className="text-bazi-gold/70 shrink-0 mt-0.5 text-[8px]">◆</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-amber-200">{localizeNamePair(d.name_en, d.name_cn, language)}</span>
                    <p className="text-amber-50/80 mt-0.5 leading-relaxed text-xs">
                      {language === 'en' && d.interpretation_en}
                      {language === 'zh-TW' && d.interpretation_zh_tw}
                      {language === 'zh-CN' && d.interpretation_zh_cn}
                      {language === 'ko' && (d.interpretation_ko || d.interpretation_en)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </ErrorBoundary>

      {/* Annual Luck Card - Year Forecast */}
      {annual_luck && annual_luck.annual_pillar && (
        <ErrorBoundary language={language} label={getMisc('forecast')}>
        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card animate-reveal-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-semibold text-amber-100 tracking-wide mb-1">
            {annual_luck.annual_pillar.year} {getMisc('forecast')}
          </h2>
          <p className="text-sm text-amber-50 mb-4">
            {labels.currentYear}: {annual_luck.annual_pillar.stem?.name_cn}{annual_luck.annual_pillar.branch?.name_cn}
            {annual_luck.annual_pillar.stem?.element && ` (${localizeElement(annual_luck.annual_pillar.stem.element, language)} ${localizeZodiac(annual_luck.annual_pillar.branch?.zodiac, language)})`}
          </p>
          {annual_luck.interactions && annual_luck.interactions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold text-amber-200 mb-3">{labels.interactions}</h3>
              <div className="space-y-2">
                {annual_luck.interactions.map((int, idx) => {
                  const isClash = int.type === 'Clash'
                  return (
                    <div key={idx} className={`flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${isClash ? 'bg-rose-950/20 border-rose-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
                      <span className={`shrink-0 mt-0.5 text-sm ${isClash ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isClash ? '◇' : '◆'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`font-semibold text-xs uppercase tracking-wider ${isClash ? 'text-rose-300' : 'text-emerald-300'}`}>{localizeInteractionType(int.type, language)}</span>
                        <p className="text-amber-50/80 mt-0.5 leading-relaxed text-xs">{int.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {sectionContent.annual_forecast ? (
            <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
              <LockedOverlay isLocked={sectionLocked.annual_forecast} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
                <SectionContent content={sectionContent.annual_forecast} />
              </LockedOverlay>
            </div>
          ) : loading ? (
            <div className="mt-4 pt-4 border-t border-white/5">
              <SectionSkeleton lines={4} />
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <p className="text-sm text-rose-300/90 italic">
                {sectionErrors.annual_forecast || sectionFailedLabel}
              </p>
              {onRetry && (
                <button onClick={onRetry} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-200 hover:bg-rose-900/30 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                  {retryLabel}
                </button>
              )}
            </div>
          )}
        </div>
        </ErrorBoundary>
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
          <ErrorBoundary language={language} label={getMisc('currentDecade')}>
          <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card animate-reveal-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-semibold text-amber-100 tracking-wide mb-2">
              {getMisc('currentDecade')}
            </h2>
            <p className="text-sm text-amber-200 mb-3">
              {periodLabel}
            </p>
            <SectionWithSkeleton content={sectionContent.current_age_period} loading={loading} skeletonLines={4} generatingLabel={generatingLabel} failedLabel={sectionFailedLabel} sectionError={sectionErrors.current_age_period} retryLabel={retryLabel} onRetry={onRetry}>
              <LockedOverlay isLocked={sectionLocked.current_age_period} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
                <SectionContent content={sectionContent.current_age_period} />
              </LockedOverlay>
            </SectionWithSkeleton>
          </div>
          </ErrorBoundary>
        )
      })()}

      {/* Life domain summary, then Age-based Luck Periods */}
      {age_periods && age_periods.length > 0 && (
        <>
          <ErrorBoundary language={language} label={labels.ageTimeline}>
          <LifeDomainSummary agePeriods={age_periods} language={language} />
          <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-2xl font-semibold text-amber-100 tracking-wide">
                {labels.ageTimeline}
              </h2>
            </div>
            {sectionContent.age_periods_timeline ? (
              <div className="animate-fade-in">
                <LockedOverlay isLocked={sectionLocked.age_periods_timeline} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
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
                </LockedOverlay>
              </div>
            ) : loading ? (
              <SectionSkeleton lines={6} />
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-rose-300/90 italic">{sectionErrors.age_periods_timeline || sectionFailedLabel}</p>
                {onRetry && (
                  <button onClick={onRetry} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-200 hover:bg-rose-900/30 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                    {retryLabel}
                  </button>
                )}
              </div>
            )}
          </div>
          </ErrorBoundary>
        </>
      )}


      {/* Insights Card - skeleton when loading, locked overlay for free users, failure when complete but empty */}
      <ErrorBoundary language={language} label={labels.insights}>
      {insights ? (
        <div className="animate-fade-in">
          <LockedOverlay isLocked={insightsLocked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <EnhancedInsightDisplay insights={insights} language={language} />
          </LockedOverlay>
        </div>
      ) : insightsLocked ? (
        <div className="animate-fade-in">
          <LockedOverlay isLocked={true} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card min-h-[120px]" />
          </LockedOverlay>
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card animate-pulse">
          <div className="h-6 bg-neutral-800 rounded w-1/3 mb-4" />
          <SectionSkeleton lines={6} />
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 md:p-8 shadow-card space-y-2">
          <p className="text-sm text-rose-300/90 italic">{insightsFailedLabel}</p>
          {onRetry && (
            <button onClick={onRetry} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-500/30 text-rose-200 hover:bg-rose-900/30 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
              {retryLabel}
            </button>
          )}
        </div>
      )}
      </ErrorBoundary>

      {/* Export & Share bar — visible once analysis is complete */}
      {analysisComplete && (
        <ExportShareBar
          baziChart={baziChart}
          language={language}
          isPremium={isPremium}
          onUpgradeClick={onUpgradeClick}
          shareCardRef={shareCardRef}
        />
      )}

      {/* Hidden share card for image generation (fixed off-screen, no layout impact) */}
      {analysisComplete && (
        <ShareCard
          ref={shareCardRef}
          baziChart={baziChart}
          sectionContent={sectionContent}
          language={language}
        />
      )}
    </div>
  )
}


export default ResultsDisplay
