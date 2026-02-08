import React from 'react'

const RING_SIZE = 180
const STROKE_WIDTH = 12
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Large circular score ring with animated fill + mood keyword
 */
export default function FortuneRing({ score = 0, mood = '', language }) {
  const pct = Math.max(0, Math.min(100, score))
  const offset = CIRCUMFERENCE * (1 - pct / 100)

  // Color gradient based on score
  const getColor = (s) => {
    if (s >= 80) return '#22c55e'  // green
    if (s >= 60) return '#d4af37'  // gold
    if (s >= 40) return '#f59e0b'  // amber
    if (s >= 20) return '#f97316'  // orange
    return '#ef4444'               // red
  }

  const color = getColor(pct)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
            stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE_WIDTH} fill="none"
          />
          {/* Score ring */}
          <circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
            stroke={color} strokeWidth={STROKE_WIDTH} fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>{pct}</span>
          <span className="text-xs text-neutral-400 -mt-0.5">/100</span>
        </div>
      </div>
      {/* Mood keyword */}
      {mood && (
        <span className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
          style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
          {mood}
        </span>
      )}
    </div>
  )
}
