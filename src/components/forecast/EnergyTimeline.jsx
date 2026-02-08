import React from 'react'
import { localizeForecastUI } from '../../utils/localize'

const LEVEL_COLORS = {
  high:   '#22c55e',
  medium: '#d4af37',
  low:    '#6b7280',
}

export default function EnergyTimeline({ rhythm = [], language }) {
  if (!rhythm.length) return null
  const maxScore = Math.max(...rhythm.map(r => r.score), 1)

  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-widest mb-3">
        {localizeForecastUI('energyRhythm', language)}
      </h3>
      <div className="flex items-end gap-1 h-28">
        {rhythm.map((h, i) => {
          const pct = (h.score / 100) * 100
          const color = LEVEL_COLORS[h.level] || '#6b7280'
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-neutral-500 font-medium">{h.score}</span>
              <div className="w-full bg-white/5 rounded-t-md overflow-hidden" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${pct}%`,
                    background: color,
                    marginTop: `${100 - pct}%`,
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="text-[9px] text-neutral-500 leading-none">{h.branch}</span>
              <span className="text-[8px] text-neutral-600 leading-none whitespace-nowrap">
                {h.time?.split('-')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
