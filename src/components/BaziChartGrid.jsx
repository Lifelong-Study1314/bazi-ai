import React from 'react'
import { localizeElement, localizeZodiac, localizeNamePair } from '../utils/localize'

const ELEMENT_COLORS = {
  Wood: '#4CAF50',
  Fire: '#FF5722',
  Earth: '#F4B183',
  Metal: '#C0C0C0',
  Water: '#2196F3',
}

const pillarNames = {
  en: { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' },
  'zh-TW': { year: '年', month: '月', day: '日', hour: '時' },
  'zh-CN': { year: '年', month: '月', day: '日', hour: '时' },
  ko: { year: '년', month: '월', day: '일', hour: '시' },
}

const tooltipLabels = {
  en: { tenGod: 'Ten God:', hidden: 'Hidden:' },
  'zh-TW': { tenGod: '十神：', hidden: '藏干：' },
  'zh-CN': { tenGod: '十神：', hidden: '藏干：' },
  ko: { tenGod: '십성:', hidden: '장간:' },
}

const BaziChartGrid = ({ four_pillars, language = 'en' }) => {
  if (!four_pillars) return null

  const pillars = ['year', 'month', 'day', 'hour']

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto"
      role="grid"
      aria-label="Four Pillars chart"
    >
      {pillars.map((pillarKey, idx) => {
        const pillarData = four_pillars[pillarKey]
        if (!pillarData?.stem || !pillarData?.branch) return null

        const isDayPillar = pillarKey === 'day'
        const stem = pillarData.stem
        const branch = pillarData.branch
        const stemTenGod = stem.ten_god
        const branchTenGod = branch.ten_god

        const label = pillarNames[language]?.[pillarKey] || pillarNames.en[pillarKey]
        const tt = tooltipLabels[language] || tooltipLabels.en
        const stemColor = ELEMENT_COLORS[stem.element] || '#d4af37'
        const branchColor = ELEMENT_COLORS[branch.element] || '#d4af37'

        return (
          <div
            key={pillarKey}
            role="gridcell"
            aria-label={`${label} pillar: ${stem.name_cn} ${branch.name_cn}`}
            className={`rounded-xl border overflow-hidden transition-all duration-200 min-w-0 animate-flip-in hover:scale-[1.02] hover:shadow-lg ${
              isDayPillar
                ? 'border-bazi-gold/50 bg-bazi-surface/90 ring-1 ring-bazi-gold/30 animate-glow-pulse'
                : 'border-white/5 bg-bazi-surface/80 hover:border-amber-500/20'
            }`}
            style={{ animationDelay: `${idx * 200}ms` }}
          >
            {/* Pillar label */}
            <div className="px-2 py-1.5 text-center border-b border-white/5">
              <p className="text-xs font-semibold text-neutral-500">{label}</p>
            </div>

            {/* Stem cell (top) */}
            <div
              title={`${stem.name_cn} (${localizeElement(stem.element, language)})${stemTenGod?.name_en ? ` — ${tt.tenGod} ${localizeNamePair(stemTenGod.name_en, stemTenGod.name_cn, language)}` : ''}`}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 ${isDayPillar ? 'py-3 sm:py-5' : ''} border-b border-white/5`}
            >
              <span
                className={`font-bold text-amber-50 mb-1 ${
                  isDayPillar ? 'text-lg sm:text-3xl' : 'text-lg sm:text-2xl'
                }`}
              >
                {stem.name_cn}
              </span>
              <span
                className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium mb-1"
                style={{
                  backgroundColor: `${stemColor}20`,
                  color: stemColor,
                  border: `1px solid ${stemColor}60`,
                }}
              >
                {localizeElement(stem.element, language)}
              </span>
              {stemTenGod?.name_en && (
                <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5">
                  {localizeNamePair(stemTenGod.name_en, stemTenGod.name_cn, language)}
                </p>
              )}
            </div>

            {/* Branch cell (bottom) */}
            <div
              title={`${branch.name_cn} (${localizeElement(branch.element, language)})${branch.zodiac ? ` — ${localizeZodiac(branch.zodiac, language)}` : ''}${branchTenGod?.name_en ? ` — ${tt.tenGod} ${localizeNamePair(branchTenGod.name_en, branchTenGod.name_cn, language)}` : ''}${branch.hidden_stems?.length ? ` — ${tt.hidden} ${branch.hidden_stems.map(s => s.name_cn).join('')}` : ''}`}
              className="flex flex-col items-center justify-center p-2 sm:p-3"
            >
              <span className="text-base sm:text-xl font-bold text-amber-50 mb-1">
                {branch.name_cn}
              </span>
              <span
                className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-medium mb-0.5"
                style={{
                  backgroundColor: `${branchColor}20`,
                  color: branchColor,
                  border: `1px solid ${branchColor}60`,
                }}
              >
                {localizeElement(branch.element, language)}
              </span>
              {branch.zodiac && (
                <p className="text-[9px] sm:text-[10px] text-neutral-500">{localizeZodiac(branch.zodiac, language)}</p>
              )}
              {branch.hidden_stems && branch.hidden_stems.length > 0 && (
                <p
                  className="text-[8px] sm:text-[9px] text-neutral-500 mt-0.5"
                  title={`${tt.hidden} ${branch.hidden_stems.map(s => `${s.name_cn} (${localizeElement(s.element, language)})`).join(', ')}`}
                >
                  {branch.hidden_stems.map(s => s.name_cn).join('')}
                </p>
              )}
              {branchTenGod?.name_en && (
                <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5">
                  {localizeNamePair(branchTenGod.name_en, branchTenGod.name_cn, language)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default BaziChartGrid
