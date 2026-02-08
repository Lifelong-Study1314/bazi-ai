import React from 'react'
import SectionContent from './SectionContent'
import { localizeElement } from '../utils/localize'

/**
 * ElementWheel — Five Elements pentagonal radar chart.
 *
 * Visuals:
 *   - Pentagonal layout (Wood, Fire, Earth, Metal, Water)
 *   - Outer generation cycle pentagon
 *   - Inner control cycle star
 *   - Filled radar polygon showing element strength percentages
 *   - "Mystical Luxury" dark/gold theme
 */

const ELEMENT_STYLES = {
  Wood:  { color: '#10b981', glow: '0 0 15px rgba(16, 185, 129, 0.3)' },
  Fire:  { color: '#ef4444', glow: '0 0 15px rgba(239, 68, 68, 0.3)' },
  Earth: { color: '#d4af37', glow: '0 0 15px rgba(212, 175, 55, 0.3)' },
  Metal: { color: '#94a3b8', glow: '0 0 15px rgba(148, 163, 184, 0.3)' },
  Water: { color: '#3b82f6', glow: '0 0 15px rgba(59, 130, 246, 0.3)' },
}

const THEME_GOLD = '#D4AF37'

export default function ElementWheel({ elements, language = 'en', customAdvice = null }) {
  if (!elements?.counts) return null

  const size = 440
  const center = size / 2
  const radius = size * 0.36
  const nodeRadius = 34
  const elementOrder = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']

  const counts = elements.counts
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const percentages = elementOrder.map(el => ({
    element: el,
    percent: Math.round(((counts[el] || 0) / total) * 100),
    count: counts[el] || 0,
  }))

  // Pentagon node positions
  const points = elementOrder.map((_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      element: elementOrder[i],
      ...percentages[i],
    }
  })

  // Radar polygon (filled shadow) based on element percentage
  const radarPoints = elementOrder.map((_, i) => {
    const angle = (i * 72 - 90) * (Math.PI / 180)
    const pct = percentages[i].percent / 100
    const r = radius * (0.1 + pct * 0.9)
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  })
  const radarPath = radarPoints.map(p => `${p.x},${p.y}`).join(' ')

  // Outer pentagon path
  const outerPath = points.map(p => `${p.x},${p.y}`).join(' ')

  // AI advice text
  const recommendations = customAdvice ?? elements.analysis?.recommendations ?? ''

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[360px] aspect-square relative mx-auto">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-xl">
          {/* Outer ring glow */}
          <circle cx={center} cy={center} r={radius + 60} fill="none" stroke={THEME_GOLD} strokeWidth="1" strokeOpacity="0.1" />
          <circle cx={center} cy={center} r={radius + 40} fill="none" stroke={THEME_GOLD} strokeWidth="1" strokeOpacity="0.2" />

          {/* Generation cycle (pentagon outline) */}
          <polygon points={outerPath} fill="none" stroke={THEME_GOLD} strokeWidth="2" strokeOpacity="0.3" />

          {/* Control cycle (star) */}
          <path
            d={`M${points[0].x},${points[0].y} L${points[2].x},${points[2].y} L${points[4].x},${points[4].y} L${points[1].x},${points[1].y} L${points[3].x},${points[3].y} Z`}
            fill="none" stroke={THEME_GOLD} strokeWidth="1" strokeOpacity="0.15"
          />

          {/* Radar polygon (filled shadow area) */}
          <defs>
            <radialGradient id="radarGradient" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={THEME_GOLD} stopOpacity="0.4" />
              <stop offset="100%" stopColor={THEME_GOLD} stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <polygon
            points={radarPath}
            fill="url(#radarGradient)"
            stroke={THEME_GOLD}
            strokeWidth="2"
            strokeOpacity="0.8"
            style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.3))' }}
          />

          {/* Element nodes */}
          {points.map((p) => {
            const style = ELEMENT_STYLES[p.element]
            const label = localizeElement(p.element, language)
            return (
              <g key={p.element}>
                <circle
                  cx={p.x} cy={p.y} r={nodeRadius}
                  fill="#121216" stroke={style.color} strokeWidth="3"
                  style={{ filter: `drop-shadow(${style.glow})` }}
                />
                <text
                  x={p.x} y={p.y - 6}
                  textAnchor="middle" fill="#fff"
                  fontSize="18" fontWeight="bold" fontFamily="sans-serif"
                >
                  {p.percent}%
                </text>
                <text
                  x={p.x} y={p.y + 14}
                  textAnchor="middle" fill={style.color}
                  fontSize="13" fontWeight="600" fontFamily="serif"
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* AI Advice Text */}
      {recommendations && (
        <div className="mt-8 w-full">
          <SectionContent content={recommendations} />
        </div>
      )}
    </div>
  )
}
