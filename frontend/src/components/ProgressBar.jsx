import React from 'react'

export const ProgressBar = ({ progress, loading, language }) => {
  if (!loading) return null

  const messages = {
    en: `🔮 AI is analyzing your BAZI chart... (${Math.round(progress)}%)`,
    'zh-TW': `🔮 AI 正在分析您的八字命盤... (${Math.round(progress)}%)`,
    'zh-CN': `🔮 AI 正在分析您的八字命盘... (${Math.round(progress)}%)`
  }

  return (
    <div className="w-full mb-6 animate-fade-in">
      <div className="mb-3">
        <p className="text-white font-semibold text-center">
          {messages[language] || messages.en}
        </p>
      </div>
      
      <div className="relative w-full bg-white bg-opacity-20 rounded-full h-4 overflow-hidden border-2 border-white">
        <div
          className="h-full bg-gradient-to-r from-yellow-300 to-orange-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full bg-white opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Estimated time */}
      <p className="text-white text-sm text-center mt-3 opacity-80">
        {language === 'en' && 'This usually takes 8-15 seconds'}
        {language === 'zh-TW' && '通常需要 8-15 秒'}
        {language === 'zh-CN' && '通常需要 8-15 秒'}
      </p>
    </div>
  )
}

export default ProgressBar
