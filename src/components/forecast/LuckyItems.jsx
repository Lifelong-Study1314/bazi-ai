import React from 'react'
import { localizeForecastUI } from '../../utils/localize'

const ITEM_CONFIG = [
  { key: 'color',     icon: '🎨' },
  { key: 'number',    icon: '🔢' },
  { key: 'direction', icon: '🧭' },
  { key: 'hour',      icon: '🕐' },
  { key: 'object',    icon: '💎' },
  { key: 'food',      icon: '🍀' },
]

export default function LuckyItems({ lucky = {}, language }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-widest mb-3">
        {localizeForecastUI('luckyItems', language)}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ITEM_CONFIG.map(({ key, icon }) => {
          let value = lucky[key]
          // Hour has nested object
          if (key === 'hour' && value && typeof value === 'object') {
            value = `${value.name_loc || value.name || ''} (${value.time || ''})`
          }
          if (value === undefined || value === null || value === '') return null

          return (
            <div key={key}
              className="bg-bazi-surface-soft/60 border border-white/5 rounded-xl px-4 py-3 flex flex-col items-center text-center gap-1.5"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider">
                {localizeForecastUI(key, language)}
              </span>
              <span className="text-sm text-amber-100 font-medium leading-tight">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
