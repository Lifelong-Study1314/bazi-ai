import React from 'react'
import SectionContent from './SectionContent'

const ELEMENT_COLORS = {
  Wood: '#4CAF50',
  Fire: '#FF5722',
  Earth: '#F4B183',
  Metal: '#C0C0C0',
  Water: '#2196F3',
}

// Generation cycle order: Wood -> Fire -> Earth -> Metal -> Water -> Wood
const ELEMENT_ORDER = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']

// Destruction pairs: Wood-Earth, Earth-Water, Water-Fire, Fire-Metal, Metal-Wood
const DESTRUCTION_PAIRS = [
  ['Wood', 'Earth'],
  ['Earth', 'Water'],
  ['Water', 'Fire'],
  ['Fire', 'Metal'],
  ['Metal', 'Wood'],
]

const BALANCE_LABELS = {
  weak: {
    en: 'Elemental Balance: Needs more support',
    'zh-TW': '五行平衡：需要更多支持',
    'zh-CN': '五行平衡：需要更多支持',
    ko: '오행 균형: 보강 필요',
  },
  neutral: {
    en: 'Elemental Balance: Harmonious',
    'zh-TW': '五行平衡：和諧',
    'zh-CN': '五行平衡：和谐',
    ko: '오행 균형: 조화로움',
  },
  strong: {
    en: 'Elemental Balance: Strong',
    'zh-TW': '五行平衡：強旺',
    'zh-CN': '五行平衡：强旺',
    ko: '오행 균형: 강함',
  },
  insufficient_data: {
    en: 'Elemental Balance: Insufficient data',
    'zh-TW': '五行平衡：資料不足',
    'zh-CN': '五行平衡：资料不足',
    ko: '오행 균형: 자료 부족',
  },
}

export default function ElementWheel({ elements, language = 'en', customAdvice = null }) {
  if (!elements?.counts) return null

  const counts = elements.counts
  const analysis = elements.analysis || {}
  const balance = analysis.balance || 'neutral'
  const recommendations = customAdvice ?? analysis.recommendations ?? ''

  const maxCount = Math.max(...Object.values(counts), 1)
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.38

  // Pentagon vertices (top = Wood, clockwise: Fire, Earth, Metal, Water)
  const getVertex = (i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  const vertices = ELEMENT_ORDER.map((_, i) => getVertex(i))

  const balanceLabel = BALANCE_LABELS[balance]?.[language] || BALANCE_LABELS.neutral[language] || BALANCE_LABELS.neutral.en

  return (
    <div className="space-y-4">
      <div className="relative mx-auto w-full max-w-[280px] aspect-square">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          aria-label="Five Elements wheel"
        >
          {/* Destruction cycle (dashed, dim) */}
          <g stroke="rgba(163,163,163,0.25)" strokeWidth="1" strokeDasharray="4 3" fill="none">
            {DESTRUCTION_PAIRS.map(([a, b], i) => {
              const idxA = ELEMENT_ORDER.indexOf(a)
              const idxB = ELEMENT_ORDER.indexOf(b)
              const vA = vertices[idxA]
              const vB = vertices[idxB]
              return (
                <line
                  key={i}
                  x1={vA.x}
                  y1={vA.y}
                  x2={vB.x}
                  y2={vB.y}
                />
              )
            })}
          </g>

          {/* Generation cycle (solid arrows) */}
          <g stroke="rgba(212,175,55,0.5)" strokeWidth="2" fill="none">
            {vertices.map((v, i) => {
              const next = vertices[(i + 1) % 5]
              const midX = (v.x + next.x) / 2
              const midY = (v.y + next.y) / 2
              return (
                <line
                  key={i}
                  x1={v.x}
                  y1={v.y}
                  x2={next.x}
                  y2={next.y}
                />
              )
            })}
          </g>

          {/* Element nodes */}
          {ELEMENT_ORDER.map((elem, i) => {
            const v = vertices[i]
            const count = counts[elem] || 0
            const scale = maxCount > 0 ? 0.4 + (count / maxCount) * 0.6 : 0.6
            const nodeR = 22 * scale
            const color = ELEMENT_COLORS[elem] || '#d4af37'
            return (
              <g key={elem}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={nodeR}
                  fill={color}
                  fillOpacity={0.3 + (count / maxCount) * 0.5}
                  stroke={color}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
                <text
                  x={v.x}
                  y={v.y - 4}
                  textAnchor="middle"
                  className="text-[10px] font-bold"
                  style={{ fill: color }}
                >
                  {elem}
                </text>
                <text
                  x={v.x}
                  y={v.y + 10}
                  textAnchor="middle"
                  className="text-[9px]"
                  style={{ fill: '#a3a3a3' }}
                >
                  {count}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Balance label */}
      <p className="text-sm font-semibold text-amber-200 text-center">
        {balanceLabel}
      </p>

      {/* Actionable advice */}
      {recommendations && (
        <div className="rounded-lg border border-white/5 bg-neutral-950/60 p-3 text-sm text-amber-50">
          <p className="font-medium text-amber-200 mb-1">
            {language === 'en' && 'Actionable advice'}
            {language === 'zh-TW' && '實用建議'}
            {language === 'zh-CN' && '实用建议'}
            {language === 'ko' && '실천 가능한 조언'}
          </p>
          <SectionContent content={recommendations} className="text-neutral-300" />
        </div>
      )}
    </div>
  )
}
