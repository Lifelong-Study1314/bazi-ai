import React, { useMemo } from 'react'

/**
 * PillarInteractions — SVG arc diagram showing natal pillar interactions
 *
 * Displays 4 pillar nodes in a row with curved arcs connecting interacting pairs.
 *   - Gold arcs (above) = positive interactions (combinations, harmonies, stem combos)
 *   - Red/orange arcs (below) = negative interactions (clashes, harms, punishments)
 */

const PILLAR_ORDER = ['year', 'month', 'day', 'hour']

const PILLAR_LABELS = {
  en: { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' },
  'zh-TW': { year: '年柱', month: '月柱', day: '日柱', hour: '時柱' },
  'zh-CN': { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' },
  ko: { year: '년주', month: '월주', day: '일주', hour: '시주' },
}

const ARC_STYLES = {
  six_combination:  { color: '#d4af37', glow: '#d4af37' },
  three_harmony:    { color: '#d4af37', glow: '#d4af37' },
  stem_combination: { color: '#92814a', glow: '#92814a' },
  six_clash:        { color: '#f87171', glow: '#ef4444' },
  six_harm:         { color: '#fb923c', glow: '#f97316' },
  three_punishment: { color: '#c084fc', glow: '#a855f7' },
  self_punishment:  { color: '#c084fc', glow: '#a855f7' },
}

const POLARITY_ICON = {
  positive: '◆',
  negative: '◇',
}

export default function PillarInteractions({ interactions, fourPillars, language = 'en' }) {
  const labels = PILLAR_LABELS[language] || PILLAR_LABELS.en

  const { positive, negative } = useMemo(() => {
    const pos = []
    const neg = []
    if (!interactions?.interactions) return { positive: pos, negative: neg }
    for (const ix of interactions.interactions) {
      if (ix.polarity === 'positive') pos.push(ix)
      else neg.push(ix)
    }
    return { positive: pos, negative: neg }
  }, [interactions])

  if (!interactions || interactions.summary?.total === 0) return null

  // SVG layout — generous spacing to prevent overlap
  const svgW = 560
  const nodeY = 170        // center line for pillar nodes
  const topPad = 50        // space above nodes for arcs + labels
  const bottomPad = 80     // space below nodes for arcs + labels
  const svgH = nodeY + bottomPad + 20

  const marginX = 70       // left/right margin so edge nodes have label room
  const usableW = svgW - marginX * 2
  const nodeSpacing = usableW / (PILLAR_ORDER.length - 1)
  const nodeX = PILLAR_ORDER.map((_, i) => marginX + i * nodeSpacing)

  const pillarIdx = {}
  PILLAR_ORDER.forEach((p, i) => { pillarIdx[p] = i })

  const getPillarText = (key) => {
    const p = fourPillars?.[key]
    if (!p) return ''
    return `${p.stem?.name_cn || ''}${p.branch?.name_cn || ''}`
  }

  // Build a quadratic bezier arc between two X positions
  const buildArc = (x1, x2, direction, stackIdx, totalStack) => {
    const spread = Math.abs(x2 - x1)
    // Base curvature proportional to spread, with minimum clearance from nodes
    const baseHeight = Math.max(55, spread * 0.38)
    // Stack offset: push each additional arc further out
    const stackGap = 30
    const height = baseHeight + stackIdx * stackGap
    const midX = (x1 + x2) / 2
    const cpY = direction === 'up' ? nodeY - height : nodeY + height
    // Label sits at the apex of the arc, nudged inward to stay clear
    const labelY = direction === 'up' ? cpY + 4 : cpY - 4
    return {
      path: `M ${x1} ${nodeY} Q ${midX} ${cpY} ${x2} ${nodeY}`,
      labelX: midX,
      labelY,
    }
  }

  const renderArcs = (group, direction) => {
    // Group by same pillar pair to stack multiple arcs
    const pairMap = {}
    for (const ix of group) {
      const ps = ix.pillars.slice(0, 2).sort().join('-')
      if (!pairMap[ps]) pairMap[ps] = []
      pairMap[ps].push(ix)
    }

    const elements = []
    for (const [, ixs] of Object.entries(pairMap)) {
      ixs.forEach((ix, stackIdx) => {
        const p1 = pillarIdx[ix.pillars[0]]
        const p2 = pillarIdx[ix.pillars.length > 1 ? ix.pillars[1] : ix.pillars[0]]
        if (p1 === undefined || p2 === undefined) return
        const x1 = nodeX[Math.min(p1, p2)]
        const x2 = nodeX[Math.max(p1, p2)]
        const style = ARC_STYLES[ix.type] || ARC_STYLES.six_clash
        const { path, labelX, labelY } = buildArc(x1, x2, direction, stackIdx, ixs.length)
        const animDelay = `${elements.length * 180}ms`

        // Shorten long Chinese labels for the pill on the arc
        const shortLabel = (ix.detail_cn || '').replace(/（.*?）/, '')

        elements.push(
          <g key={`${ix.type}-${ix.pillars.join('-')}-${stackIdx}`} className="animate-arc-draw" style={{ animationDelay: animDelay }}>
            {/* Glow */}
            <path d={path} fill="none" stroke={style.glow} strokeWidth={5} strokeOpacity={0.12} strokeLinecap="round" />
            {/* Main arc */}
            <path
              d={path} fill="none" stroke={style.color} strokeWidth={1.8} strokeOpacity={0.8}
              strokeLinecap="round" strokeDasharray="1000"
              className="animate-arc-path" style={{ animationDelay: animDelay }}
            />
            {/* Small label at arc apex */}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline={direction === 'up' ? 'auto' : 'hanging'}
              className="text-[9px] font-semibold"
              style={{ fill: style.color, paintOrder: 'stroke', stroke: '#0a0a0f', strokeWidth: 3 }}
            >
              {shortLabel}
            </text>
          </g>
        )
      })
    }
    return elements
  }

  const summary = interactions.summary || {}

  return (
    <div className="w-full">
      {/* SVG Diagram */}
      <div className="overflow-x-auto -mx-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[560px] mx-auto" style={{ minWidth: 360 }}>
          <defs>
            <filter id="glow-pi">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Positive arcs (above) */}
          {renderArcs(positive, 'up')}
          {/* Negative arcs (below) */}
          {renderArcs(negative, 'down')}

          {/* Pillar nodes */}
          {PILLAR_ORDER.map((pKey, i) => {
            const cx = nodeX[i]
            const isDay = pKey === 'day'
            const r = isDay ? 28 : 24
            return (
              <g key={pKey}>
                {/* Outer ring for Day pillar */}
                {isDay && (
                  <circle cx={cx} cy={nodeY} r={r + 4} fill="none"
                    stroke="#d4af37" strokeWidth={1} strokeOpacity={0.3} className="animate-pulse" />
                )}
                {/* Background circle */}
                <circle
                  cx={cx} cy={nodeY} r={r}
                  fill={isDay ? '#1a1510' : '#12110e'}
                  stroke={isDay ? '#d4af37' : '#6b5c3e'}
                  strokeWidth={isDay ? 1.8 : 1.2}
                  filter={isDay ? 'url(#glow-pi)' : undefined}
                />
                {/* Stem + Branch */}
                <text x={cx} y={nodeY + 1} textAnchor="middle" dominantBaseline="central"
                  className="fill-amber-100 font-bold" style={{ fontSize: 13, fontFamily: 'serif' }}>
                  {getPillarText(pKey)}
                </text>
                {/* Pillar label */}
                <text x={cx} y={nodeY + r + 16} textAnchor="middle"
                  className="fill-neutral-500" style={{ fontSize: 10 }}>
                  {labels[pKey]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Interaction cards */}
      {interactions.interactions && interactions.interactions.length > 0 && (
        <div className="mt-3 grid gap-2">
          {interactions.interactions.map((ix, idx) => {
            const style = ARC_STYLES[ix.type] || ARC_STYLES.six_clash
            return (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg bg-bazi-surface/40 border border-white/5 px-3 py-2.5 animate-fade-in"
                style={{ animationDelay: `${idx * 80 + 300}ms` }}
              >
                <span style={{ color: style.color }} className="mt-px text-sm leading-none">
                  {ix.polarity === 'positive' ? POLARITY_ICON.positive : POLARITY_ICON.negative}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border leading-tight"
                      style={{ color: style.color, borderColor: style.color + '30', backgroundColor: style.color + '10' }}
                    >
                      {ix.type_label}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">{ix.detail_cn}</span>
                    {ix.partial && (
                      <span className="text-[10px] text-neutral-600">
                        ({language === 'zh-TW' || language === 'zh-CN' ? '半合' : language === 'ko' ? '반합' : 'partial'})
                      </span>
                    )}
                    {ix.sub_label && (
                      <span className="text-[10px] text-neutral-500 italic">{ix.sub_label}</span>
                    )}
                  </div>
                  <p className="text-xs text-amber-100/70 mt-1 leading-relaxed">{ix.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 flex items-center justify-center gap-5 text-xs text-neutral-500">
        {summary.positive > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="text-bazi-gold text-sm">◆</span>
            {summary.positive} {language === 'zh-TW' || language === 'zh-CN' ? '吉' : language === 'ko' ? '길' : 'Harmonious'}
          </span>
        )}
        {summary.negative > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="text-rose-400 text-sm">◇</span>
            {summary.negative} {language === 'zh-TW' || language === 'zh-CN' ? '凶' : language === 'ko' ? '흉' : 'Challenging'}
          </span>
        )}
      </div>
    </div>
  )
}
