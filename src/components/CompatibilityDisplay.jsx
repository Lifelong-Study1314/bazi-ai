import React from 'react'
import SectionContent from './SectionContent'
import LockedOverlay from './LockedOverlay'
import { localizeElement, localizeYinYang } from '../utils/localize'

const titles = {
  en: {
    title: 'Compatibility Analysis',
    overallScore: 'Overall Score',
    breakdown: 'Dimensional Breakdown',
    aiInsight: 'AI Compatibility Insight',
    personA: 'Person A',
    personB: 'Person B',
    dayMaster: 'Day Master',
    useGod: 'Use God',
    noInsight: 'AI insight could not be generated.',
  },
  'zh-TW': {
    title: '合婚分析',
    overallScore: '總分',
    breakdown: '各維度分析',
    aiInsight: 'AI 合婚解讀',
    personA: '甲方',
    personB: '乙方',
    dayMaster: '日主',
    useGod: '用神',
    noInsight: 'AI解讀無法生成。',
  },
  'zh-CN': {
    title: '合婚分析',
    overallScore: '总分',
    breakdown: '各维度分析',
    aiInsight: 'AI 合婚解读',
    personA: '甲方',
    personB: '乙方',
    dayMaster: '日主',
    useGod: '用神',
    noInsight: 'AI解读无法生成。',
  },
  ko: {
    title: '궁합 분석',
    overallScore: '총점',
    breakdown: '차원별 분석',
    aiInsight: 'AI 궁합 해석',
    personA: '갑측',
    personB: '을측',
    dayMaster: '일주',
    useGod: '용신',
    noInsight: 'AI 해석을 생성할 수 없습니다.',
  },
}

/** Circular score gauge */
const ScoreRing = ({ score, tier, tierLabel, tierEmoji }) => {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(score, 100) / 100
  const offset = circumference * (1 - pct)

  const tierColor =
    tier === 'excellent' ? 'text-emerald-400' :
    tier === 'good' ? 'text-amber-300' :
    tier === 'average' ? 'text-sky-300' :
    tier === 'challenging' ? 'text-orange-400' :
    'text-rose-400'

  const strokeColor =
    tier === 'excellent' ? '#34d399' :
    tier === 'good' ? '#fcd34d' :
    tier === 'average' ? '#7dd3fc' :
    tier === 'challenging' ? '#fb923c' :
    '#fb7185'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#262626" strokeWidth="10" />
          <circle
            cx="80" cy="80" r={radius} fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-amber-50">{Math.round(score)}</span>
          <span className="text-xs text-neutral-400">/100</span>
        </div>
      </div>
      <div className={`mt-3 text-lg font-semibold ${tierColor} flex items-center gap-2`}>
        <span className="text-bazi-gold text-xl">◈</span>
        {tierLabel}
      </div>
    </div>
  )
}

/** Single dimension bar */
const DimensionBar = ({ dim, language }) => {
  const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0
  const label = dim.label?.[language] || dim.label?.en || dim.key
  const detail = dim.detail?.[language] || dim.detail?.en || ''

  const barColor =
    pct >= 80 ? 'from-emerald-500 to-emerald-400' :
    pct >= 60 ? 'from-amber-500 to-amber-400' :
    pct >= 40 ? 'from-sky-500 to-sky-400' :
    'from-rose-500 to-rose-400'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-amber-100 font-medium">{label}</span>
        <span className="text-neutral-400 text-xs">{dim.score}/{dim.max_score}</span>
      </div>
      {detail && <p className="text-xs text-neutral-500">{detail}</p>}
      <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {dim.relationship_label && (
        <p className="text-xs text-amber-200/70 italic">{dim.relationship_label}</p>
      )}
    </div>
  )
}

/** Person summary mini-card */
const PersonCard = ({ person, label, color, language }) => {
  const dm = person?.day_master || {}
  const ug = person?.use_god || {}
  const borderCls = color === 'pink' ? 'border-amber-500/30' : 'border-amber-700/30'
  const bgCls = color === 'pink' ? 'bg-amber-950/20' : 'bg-neutral-900/40'
  const labelCls = color === 'pink' ? 'text-amber-200' : 'text-amber-300/80'
  const t = titles[language] || titles.en

  return (
    <div className={`rounded-lg border ${borderCls} ${bgCls} p-4`}>
      <h4 className={`text-sm font-semibold ${labelCls} mb-2`}><span className="text-bazi-gold">{color === 'pink' ? '◆' : '◇'}</span> {label}</h4>
      <div className="space-y-1 text-sm">
        <p className="text-amber-100">
          <span className="text-neutral-500">{t.dayMaster}: </span>
          {dm.stem_cn} — {localizeElement(dm.element, language)} ({localizeYinYang(dm.yin_yang, language)})
        </p>
        {ug.use_god && (
          <p className="text-amber-100">
            <span className="text-neutral-500">{t.useGod}: </span>
            {ug.use_god_emoji} {ug.use_god}
          </p>
        )}
      </div>
    </div>
  )
}

export const CompatibilityDisplay = ({ result, language, isAuthenticated = false, isPremium = false, onUpgradeClick }) => {
  if (!result) return null

  const { compatibility, ai_insight, chart_a, chart_b } = result
  const t = titles[language] || titles.en

  return (
    <div className="space-y-8 animate-reveal-up">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-amber-100 text-center tracking-wide">
        {t.title}
      </h2>

      {/* Person summaries side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonCard
          person={{ day_master: chart_a?.day_master, use_god: chart_a?.use_god }}
          label={t.personA}
          color="pink"
          language={language}
        />
        <PersonCard
          person={{ day_master: chart_b?.day_master, use_god: chart_b?.use_god }}
          label={t.personB}
          color="blue"
          language={language}
        />
      </div>

      {/* Score Ring */}
      <div className="flex justify-center">
        <ScoreRing
          score={compatibility?.total_score || 0}
          tier={compatibility?.tier || 'average'}
          tierLabel={compatibility?.tier_label || ''}
          tierEmoji={compatibility?.tier_emoji || ''}
        />
      </div>

      {/* Dimensional Breakdown */}
      <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 shadow-card">
        <h3 className="text-lg font-semibold text-amber-200 mb-4">{t.breakdown}</h3>
        <div className="space-y-5">
          {(compatibility?.dimensions || []).map(dim => (
            <DimensionBar key={dim.key} dim={dim} language={language} />
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <div className="rounded-xl border border-white/5 bg-neutral-900/50 p-6 shadow-card">
        <h3 className="text-lg font-semibold text-amber-200 mb-4">{t.aiInsight}</h3>
        {ai_insight ? (
          <div className="animate-fade-in">
            <LockedOverlay isLocked={result?.ai_insight_locked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
              <SectionContent content={ai_insight} />
            </LockedOverlay>
          </div>
        ) : (
          <p className="text-sm text-rose-300/90 italic">{t.noInsight}</p>
        )}
      </div>
    </div>
  )
}

export default CompatibilityDisplay
