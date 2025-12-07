import React, { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import EnhancedInsightDisplay from './EnhancedInsightDisplay'
import './ResultsDisplay.css'

export const ResultsDisplay = ({ baziChart, insights, language }) => {
  if (!baziChart) return null

  const { four_pillars, day_master, elements } = baziChart

  const titles = {
    en: {
      chart: 'Your BAZI Chart',
      pillars: 'Four Pillars',
      dayMaster: 'Day Master (Your Core)',
      elements: 'Five Elements Analysis',
      status: 'Status:'
    },
    'zh-TW': {
      chart: '您的八字命盤',
      pillars: '四柱',
      dayMaster: '日主（您的核心）',
      elements: '五行分析',
      status: '狀態：'
    },
    'zh-CN': {
      chart: '您的八字命盤',
      pillars: '四柱',
      dayMaster: '日主（您的核心）',
      elements: '五行分析',
      status: '状态：'
    },
    'ko': {
      chart: '당신의 사주 차트',
      pillars: '사주 네 기둥',
      dayMaster: '일주 (당신의 핵심)',
      elements: '오행 분석',
      status: '상태:'
    }
  }

  const labels = titles[language] || titles.en

  const pillarNames = {
    en: { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' },
    'zh-TW': { year: '年', month: '月', day: '日', hour: '時' },
    'zh-CN': { year: '年', month: '月', day: '日', hour: '时' },
    'ko': { year: '년', month: '월', day: '일', hour: '시' }
  }

  return (
    <div className="space-y-6 animate-slide-in pb-4">

      {/* BAZI Chart Card */}
      <div 
        className="rounded-xl shadow-lg p-6"
        style={{ backgroundColor: '#242d42', border: '1px solid #2a3142' }}
      >
        <h2 
          className="text-2xl font-bold mb-4 pb-3 border-b-2"
          style={{ color: '#c9a969', borderBottomColor: '#b08d57' }}
        >
          {labels.chart}
        </h2>

        {/* Four Pillars */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#f5f1e6' }}>
            {labels.pillars}
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const pillarData = four_pillars[pillar]
              
              return (
                <div 
                  key={pillar} 
                  className="rounded-lg p-4 text-center"
                  style={{ backgroundColor: '#1e2438', border: '1px solid #2a3142' }}
                >
                  <p 
                    className="text-sm font-bold mb-2"
                    style={{ color: '#c9a969' }}
                  >
                    {pillarNames[language]?.[pillar] || pillarNames.en[pillar]}
                  </p>
                  <div 
                    className="text-2xl font-bold mb-2"
                    style={{ color: '#f5f1e6' }}
                  >
                    {pillarData.stem.name_cn}{pillarData.branch.name_cn}
                  </div>
                  <p className="text-xs" style={{ color: '#a0a8c4' }}>
                    {pillarData.stem.element}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day Master */}
        <div 
          className="mb-6 rounded-lg p-4"
          style={{ backgroundColor: '#1a2035', border: '1px solid #2a3142' }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#f5f1e6' }}>
            {labels.dayMaster}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold" style={{ color: '#c9a969' }}>
                {day_master.stem_cn}
              </p>
              <p className="text-gray-400" style={{ color: '#a0a8c4' }}>
                {day_master.element} ({day_master.yin_yang})
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        {/* Elements */}
        <div 
          className="rounded-lg p-4"
          style={{ backgroundColor: '#1a2035', border: '1px solid #2a3142' }}
        >
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#f5f1e6' }}>
            {labels.elements}
          </h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(elements.counts).map(([elem, count]) => {
              const colors = {
                'Wood': { bg: '#2d5016', text: '#7ec850' },
                'Fire': { bg: '#5c2e2e', text: '#ff6b6b' },
                'Earth': { bg: '#5c4e2e', text: '#ffd700' },
                'Metal': { bg: '#3a3a3a', text: '#e0e0e0' },
                'Water': { bg: '#2e3a5c', text: '#6ba3ff' }
              }
              const color = colors[elem] || { bg: '#2a3142', text: '#a0a8c4' }
              
              return (
                <div 
                  key={elem} 
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: color.bg, border: `1px solid ${color.text}30` }}
                >
                  <p className="font-bold text-lg" style={{ color: color.text }}>
                    {count}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: color.text }}>
                    {elem}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="text-sm" style={{ color: '#a0a8c4' }}>
            <strong style={{ color: '#f5f1e6' }}>{labels.status}</strong> {elements.analysis.balance}
          </p>
        </div>
      </div>

      {/* Insights - Let EnhancedInsightDisplay handle it */}
      {insights && (
        <EnhancedInsightDisplay insights={insights} />
      )}
    </div>
  )
}

export default ResultsDisplay