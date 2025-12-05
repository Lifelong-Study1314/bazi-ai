import React, { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import EnhancedInsightDisplay from './EnhancedInsightDisplay';
import ElementChart from './ElementChart';  // ← NEW


export const ResultsDisplay = ({ baziChart, insights, language }) => {
  const insightsRef = useRef(null)


  // Auto-scroll as new insights arrive
  useEffect(() => {
    if (insightsRef.current) {
      insightsRef.current.scrollTop = insightsRef.current.scrollHeight
    }
  }, [insights])


  if (!baziChart) return null


  const { four_pillars, day_master, elements } = baziChart


  const titles = {
    en: {
      chart: 'Your BAZI Chart',
      pillars: 'Four Pillars',
      dayMaster: 'Day Master (Your Core)',
      elements: 'Five Elements Analysis',
      insights: 'Comprehensive Insights'
    },
    'zh-TW': {
      chart: '您的八字命盤',
      pillars: '四柱',
      dayMaster: '日主（您的核心）',
      elements: '五行分析',
      insights: '綜合分析'
    },
    'zh-CN': {
      chart: '您的八字命盘',
      pillars: '四柱',
      dayMaster: '日主（您的核心）',
      elements: '五行分析',
      insights: '综合分析'
    }
  }


  const labels = titles[language] || titles.en


  return (
    <div className="space-y-6 animate-slide-in">
      {/* BAZI Chart Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-purple-600">
          {labels.chart}
        </h2>


        {/* Four Pillars */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">{labels.pillars}</h3>
          <div className="grid grid-cols-4 gap-3">
            {['year', 'month', 'day', 'hour'].map((pillar) => {
              const pillarData = four_pillars[pillar]
              const pillarNames = {
                en: { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' },
                'zh-TW': { year: '年', month: '月', day: '日', hour: '時' },
                'zh-CN': { year: '年', month: '月', day: '日', hour: '时' }
              }
              
              return (
                <div key={pillar} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 text-center">
                  <p className="text-sm font-bold text-purple-800 mb-2">{pillarNames[language]?.[pillar] || pillarNames.en[pillar]}</p>
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {pillarData.stem.name_cn}{pillarData.branch.name_cn}
                  </div>
                  <p className="text-xs text-gray-600">{pillarData.stem.element}</p>
                </div>
              )
            })}
          </div>
        </div>


        {/* Day Master */}
        <div className="mb-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{labels.dayMaster}</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-900">{day_master.stem_cn}</p>
              <p className="text-gray-600">{day_master.element} ({day_master.yin_yang})</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>


        {/* Elements - UPDATED */}
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">{labels.elements}</h3>
          
          {/* NEW: Add the chart here */}
          <div className="mb-6 bg-white rounded-lg p-4">
            <ElementChart elements={elements} />
          </div>
          
          {/* Keep existing elements display */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Object.entries(elements.counts).map(([elem, count]) => {
              const colors = {
                'Wood': 'bg-green-200 text-green-900',
                'Fire': 'bg-red-200 text-red-900',
                'Earth': 'bg-yellow-200 text-yellow-900',
                'Metal': 'bg-gray-200 text-gray-900',
                'Water': 'bg-blue-200 text-blue-900'
              }
              
              return (
                <div key={elem} className={`${colors[elem]} rounded-lg p-3 text-center`}>
                  <p className="font-bold text-lg">{count}</p>
                  <p className="text-xs font-semibold">{elem}</p>
                </div>
              )
            })}
          </div>
          <p className="text-sm text-gray-700">
            <strong>{language === 'en' ? 'Status:' : language === 'zh-TW' ? '狀態：' : '状态：'}</strong> {elements.analysis.balance}
          </p>
        </div>
      </div>


      {/* Insights Card */}
      {insights && (
        <EnhancedInsightDisplay insights={insights} />
      )}
    </div>
  )
}


export default ResultsDisplay
