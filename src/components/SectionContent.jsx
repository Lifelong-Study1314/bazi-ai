import React from 'react'
import { stripDisclaimers } from '../utils/stripDisclaimers'

/**
 * Rich renderer for AI-generated section content.
 *
 * All section prompts enforce a strict template with predictable labels.
 * This renderer detects those labels and applies consistent formatting.
 *
 * Supported patterns:
 *   ### Sub-header              → amber sub-heading with left accent bar
 *   **bold text**               → amber-200 bold
 *   - / * bullet                → gold diamond bullet with indentation
 *   1. / 1) numbered            → gold circled number
 *   Label: value                → label highlighted (gold / green / rose) + body value
 *   Label:  (no value)          → styled section header for bullet group below
 *   --- or ***                  → gradient separator
 *   empty line                  → vertical spacer
 */

// ── Label categorisation ─────────────────────────────────────────────────

const POSITIVE_LABELS = new Set([
  // EN
  'Do', 'Focus on', 'Lucky Months', 'Opportunities', 'Recommendation', 'Action',
  // zh-TW
  '做', '專注', '專注於', '吉月', '機遇', '建議', '行動',
  // zh-CN
  '做', '专注', '专注于', '吉月', '机遇', '建议', '行动',
  // ko
  '하세요', '집중', '길월', '기회', '조언', '행동',
])

const NEGATIVE_LABELS = new Set([
  // EN
  'Avoid', 'Caution Months', 'Challenges', 'Caution', 'Note',
  // zh-TW
  '避免', '凶月', '挑戰', '注意',
  // zh-CN
  '避免', '凶月', '挑战', '注意',
  // ko
  '피하세요', '흉월', '도전', '주의',
])

// All recognized keyword labels (union of positive + negative + neutral)
const ALL_LABELS = [
  // ── English ──
  'Overview', 'Theme', 'Role', 'Interaction', 'Career', 'Relationships',
  'Meaning', 'This Year', 'This Season', 'This Month',
  'Why', 'Daily Actions', 'Key Impact',
  'Key Focus', 'Timing', 'Present', 'Missing',
  'Lucky Months', 'Caution Months',
  'Opportunities', 'Challenges',
  'Do', 'Avoid', 'Focus on',
  'Recommendation', 'Suggestion', 'Action', 'Caution', 'Note',
  'Q1', 'Q2', 'Q3', 'Q4',
  // Compatibility-specific
  'Analogy', 'Zodiac', 'Complementarity',

  // ── zh-TW ──
  '概述', '主題', '角色', '互動', '事業', '感情',
  '含義', '今年', '本季', '本月',
  '原因', '日常行動', '關鍵影響',
  '關鍵重點', '時機', '時間指引', '出現', '缺失',
  '吉月', '凶月',
  '機遇', '挑戰',
  '做', '避免', '專注', '專注於',
  '建議', '注意', '行動', '重點', '提示',
  // Compatibility-specific
  '比喻', '生肖', '互補',

  // ── zh-CN ──
  '概述', '主题', '角色', '互动', '事业', '感情',
  '含义', '今年', '本季', '本月',
  '原因', '日常行动', '关键影响',
  '关键重点', '时机', '时间指引', '出现', '缺失',
  '吉月', '凶月',
  '机遇', '挑战',
  '做', '避免', '专注', '专注于',
  '建议', '注意', '行动', '重点', '提示',
  // Compatibility-specific
  '比喻', '生肖', '互补',

  // ── Korean ──
  '개요', '주제', '역할', '상호작용', '직업', '인간관계',
  '의미', '올해', '이번 계절', '이번 달',
  '이유', '일상 행동', '핵심 영향',
  '핵심 초점', '시기', '출현', '결핍',
  '길월', '흉월',
  '기회', '도전',
  '하세요', '피하세요', '집중',
  '조언', '주의', '행동',
  // Compatibility-specific
  '비유', '띠', '상호보완',
]

// Build regex — sort by length descending so longer labels match first
const sortedLabels = [...new Set(ALL_LABELS)].sort((a, b) => b.length - a.length)
const escapedLabels = sortedLabels.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
// (.*) allows empty value — label-only lines act as section headers
const KEYWORD_RE = new RegExp(
  `^(${escapedLabels.join('|')}|Q[1-4](?:\\s*[（(][^)）]*[)）])?)[：:]\\s*(.*)$`
)


export const SectionContent = React.memo(({ content, className = '' }) => {
  if (!content || typeof content !== 'string') return null

  const cleaned = stripDisclaimers(content)
  const lines = cleaned.split('\n')

  return (
    <div className={`sc-root space-y-1.5 text-sm text-amber-50/90 leading-relaxed ${className}`.trim()}>
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  )
})

SectionContent.displayName = 'SectionContent'
export default SectionContent

/* ——— line-level renderer ——— */

function renderLine(line, i) {
  const trimmed = line.trim()
  if (!trimmed) return <div key={i} className="h-2" aria-hidden />

  // ── Sub-header: ### or #### ──
  if (/^#{2,4}\s+/.test(trimmed)) {
    const text = trimmed.replace(/^#{2,4}\s+/, '')
    return (
      <h4 key={i} className="flex items-center gap-2 text-amber-200 font-semibold text-[13px] mt-3 mb-0.5 tracking-wide">
        <span className="w-0.5 h-4 rounded-full bg-bazi-gold/70 shrink-0" />
        {renderInline(text)}
      </h4>
    )
  }

  // ── Bullet point: - or * ──
  if (/^[-*]\s+/.test(trimmed)) {
    const text = trimmed.replace(/^[-*]\s+/, '')
    return (
      <div key={i} className="flex gap-2 pl-3 group">
        <span className="text-bazi-gold/80 shrink-0 mt-[5px] text-[7px] leading-none">◆</span>
        <span className="flex-1 text-amber-50/85">{renderInline(text)}</span>
      </div>
    )
  }

  // ── Numbered list: 1. or 1) ──
  const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/)
  if (numMatch) {
    return (
      <div key={i} className="flex gap-2.5 pl-0.5">
        <span className="w-[18px] h-[18px] rounded-full bg-bazi-gold/10 border border-bazi-gold/30 text-bazi-gold flex items-center justify-center shrink-0 text-[10px] font-bold mt-[3px]">
          {numMatch[1]}
        </span>
        <span className="flex-1 text-amber-50/85">{renderInline(numMatch[2])}</span>
      </div>
    )
  }

  // ── Separator ──
  if (trimmed === '---' || trimmed === '***' || trimmed === '───') {
    return <div key={i} className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent my-1.5" />
  }

  // ── Keyword line: Label: value  OR  Label: (empty → section header) ──
  const kwMatch = trimmed.match(KEYWORD_RE)
  if (kwMatch) {
    const label = kwMatch[1]
    const value = (kwMatch[2] || '').trim()
    const isPositive = POSITIVE_LABELS.has(label)
    const isNegative = NEGATIVE_LABELS.has(label)
    const colorCls = isNegative ? 'text-rose-300' : isPositive ? 'text-emerald-300' : 'text-amber-200'

    if (!value) {
      // ── Label header (no value) — acts as section header for bullets below ──
      return (
        <div key={i} className="flex items-center gap-2 mt-2.5 mb-0.5">
          <span className={`w-0.5 h-3.5 rounded-full shrink-0 ${isNegative ? 'bg-rose-400/60' : isPositive ? 'bg-emerald-400/60' : 'bg-bazi-gold/60'}`} />
          <span className={`font-semibold text-[13px] tracking-wide ${colorCls}`}>
            {label}
          </span>
        </div>
      )
    }

    // ── Label: value (inline pair) ──
    return (
      <div key={i} className="flex gap-1.5 items-start mt-1">
        <span className={`font-semibold shrink-0 ${colorCls}`}>
          {label}:
        </span>
        <span className="flex-1 text-amber-50/85">{renderInline(value)}</span>
      </div>
    )
  }

  // ── Regular paragraph ──
  return (
    <p key={i} className="text-inherit leading-relaxed">
      {renderInline(trimmed)}
    </p>
  )
}

/* ——— inline renderer: **bold** ——— */

function renderInline(text) {
  if (!text) return text
  if (!text.includes('**')) return text

  const parts = text.split(/\*\*([^*]+)\*\*/)
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      const isLabel = /[:：]\s*$/.test(part)
      return (
        <strong key={idx} className={isLabel ? 'text-amber-200 font-semibold' : 'text-amber-100 font-semibold'}>
          {part}
        </strong>
      )
    }
    return part || null
  })
}
