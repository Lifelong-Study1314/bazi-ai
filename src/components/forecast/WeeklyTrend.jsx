import React from 'react'
import { localizeForecastUI } from '../../utils/localize'

export default function WeeklyTrend({ trend = [], language }) {
  if (!trend.length) return null

  const getBarColor = (score, isToday) => {
    if (isToday) return '#d4af37'
    if (score >= 70) return '#22c55e'
    if (score >= 50) return '#f59e0b'
    if (score >= 30) return '#f97316'
    return '#ef4444'
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-widest mb-3">
        {localizeForecastUI('weeklyTrend', language)}
      </h3>
      <div className="flex items-end gap-2 h-36">
        {trend.map((d, i) => {
          const pct = Math.max(8, d.score)
          const color = getBarColor(d.score, d.is_today)
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative">
              <span className="text-xs font-semibold" style={{ color }}>{d.score}</span>
              <div className="w-full rounded-md overflow-hidden bg-white/5" style={{ height: '90px' }}>
                <div
                  className="w-full rounded-md transition-all duration-500"
                  style={{
                    height: `${pct}%`,
                    background: color,
                    marginTop: `${100 - pct}%`,
                    opacity: d.is_today ? 1 : 0.65,
                  }}
                />
              </div>
              <span
                className={`text-xs font-medium ${d.is_today ? 'text-bazi-gold' : 'text-neutral-500'}`}
              >
                {d.day}
              </span>
              {/* Small dot indicator for the selected day — no extra height */}
              {d.is_today && (
                <span
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-bazi-gold"
                  aria-label="selected"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
