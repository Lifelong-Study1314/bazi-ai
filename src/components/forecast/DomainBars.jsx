import React from 'react'
import { localizeDomain, localizeForecastUI } from '../../utils/localize'

const DOMAIN_COLORS = {
  love:   '#ec4899',
  wealth: '#f59e0b',
  career: '#3b82f6',
  study:  '#8b5cf6',
  social: '#22c55e',
}

const DOMAIN_ICONS = {
  love:   '♥',
  wealth: '◈',
  career: '⚡',
  study:  '✎',
  social: '☺',
}

const DOMAIN_ORDER = ['love', 'wealth', 'career', 'study', 'social']

export default function DomainBars({ domains = {}, language }) {
  const visibleDomains = DOMAIN_ORDER.filter(k => domains[k] !== undefined)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-widest mb-2">
        {localizeForecastUI('domainScores', language)}
      </h3>
      {visibleDomains.map(key => {
        const val = domains[key] || 0
        const color = DOMAIN_COLORS[key] || '#d4af37'
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-lg w-6 text-center" style={{ color }}>{DOMAIN_ICONS[key]}</span>
            <span className="text-sm text-neutral-300 w-16 shrink-0">{localizeDomain(key, language)}</span>
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${val}%`, background: color }}
              />
            </div>
            <span className="text-sm font-semibold w-8 text-right" style={{ color }}>{val}</span>
          </div>
        )
      })}
    </div>
  )
}
