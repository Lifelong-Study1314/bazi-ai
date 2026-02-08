import React from 'react'
import { localizeForecastUI } from '../../utils/localize'

export default function DosAndDonts({ dos = [], donts = [], language }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-widest mb-3">
        {localizeForecastUI('dosAndDonts', language)}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Do's */}
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">✓</span>
            <span className="text-emerald-400 font-semibold text-sm">{localizeForecastUI('do', language)}</span>
          </div>
          {dos.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-neutral-300 text-sm">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        {/* Don'ts */}
        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">✕</span>
            <span className="text-red-400 font-semibold text-sm">{localizeForecastUI('dont', language)}</span>
          </div>
          {donts.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-neutral-300 text-sm">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
