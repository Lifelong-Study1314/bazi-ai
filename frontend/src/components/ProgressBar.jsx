import React from 'react'


export const ProgressBar = ({ progress, loading, language }) => {
  if (!loading) return null

  // Determine current phase based on progress
  const getPhase = () => {
    if (progress < 20) return 0
    if (progress < 40) return 1
    if (progress < 60) return 2
    if (progress < 80) return 3
    return 4
  }

  const currentPhase = getPhase()

  // Multi-language phase messages
  const phases = {
    en: [
      { emoji: '🔍', text: 'Scanning' },
      { emoji: '⚖️', text: 'Analyzing' },
      { emoji: '🌟', text: 'Evaluating' },
      { emoji: '💡', text: 'Generating' },
      { emoji: '✨', text: 'Preparing' }
    ],
    'zh-TW': [
      { emoji: '🔍', text: '掃描' },
      { emoji: '⚖️', text: '分析' },
      { emoji: '🌟', text: '評估' },
      { emoji: '💡', text: '生成' },
      { emoji: '✨', text: '準備' }
    ],
    'zh-CN': [
      { emoji: '🔍', text: '扫描' },
      { emoji: '⚖️', text: '分析' },
      { emoji: '🌟', text: '评估' },
      { emoji: '💡', text: '生成' },
      { emoji: '✨', text: '准备' }
    ],
    'ko': [
      { emoji: '🔍', text: '스캔' },
      { emoji: '⚖️', text: '분석' },
      { emoji: '🌟', text: '평가' },
      { emoji: '💡', text: '생성' },
      { emoji: '✨', text: '준비' }
    ]
  }

  const currentMessages = phases[language] || phases.en
  const currentPhaseData = currentMessages[currentPhase]

  // Full descriptions for main message
  const fullMessages = {
    en: [
      'Scanning your birth chart...',
      'Analyzing Five Elements balance...',
      'Evaluating Day Master strength...',
      'Generating personalized insights...',
      'Preparing actionable suggestions...'
    ],
    'zh-TW': [
      '掃描您的八字命盤...',
      '分析五行平衡...',
      '評估日主強弱...',
      '生成個人化洞見...',
      '準備可行動建議...'
    ],
    'zh-CN': [
      '扫描您的八字命盘...',
      '分析五行平衡...',
      '评估日主强弱...',
      '生成个人化洞见...',
      '准备可行动建议...'
    ],
    'ko': [
      '사주 명반 스캔 중...',
      '오행 균형 분석 중...',
      '일주 강약 평가 중...',
      '개인화된 통찰 생성 중...',
      '행동 제안 준비 중...'
    ]
  }

  const fullPhaseMessages = fullMessages[language] || fullMessages.en

  // Render phase indicators
  const renderPhaseIndicators = () => {
    return (
      <div className="flex justify-between items-end gap-2 mb-6 px-2">
        {currentMessages.map((phase, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
            {/* Circle indicator */}
            <div
              className="rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all duration-300"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: idx <= currentPhase 
                  ? '#c9a969' 
                  : '#1e2438',
                color: idx <= currentPhase 
                  ? '#0d1117' 
                  : '#a0a8c4',
                border: idx <= currentPhase 
                  ? '2px solid #ffd700'
                  : '2px solid #2a3142',
                boxShadow: idx <= currentPhase 
                  ? '0 4px 12px rgba(201, 169, 105, 0.3)'
                  : 'none',
                transform: idx <= currentPhase 
                  ? 'scale(1.1)'
                  : 'scale(1)'
              }}
            >
              {phase.emoji}
            </div>
            {/* Phase label - NOW VISIBLE */}
            <p 
              className="text-xs text-center leading-tight font-medium transition-colors duration-300"
              style={{
                color: idx <= currentPhase 
                  ? '#c9a969' 
                  : '#8a92b4'
              }}
            >
              {phase.text}
            </p>
          </div>
        ))}
      </div>
    )
  }

  // Animated dots
  const renderAnimatedDots = () => {
    return (
      <span className="inline-flex gap-1 ml-1">
        <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
      </span>
    )
  }

  return (
    <div className="w-full mb-8 animate-fade-in">
      {/* Phase Indicators */}
      {renderPhaseIndicators()}

      {/* Current Status Message */}
      <div className="mb-4 px-4">
        <p 
          className="font-semibold text-center text-base transition-colors duration-300"
          style={{ color: '#f5f1e6' }}
        >
          {currentPhaseData.emoji} {fullPhaseMessages[currentPhase]}
          {renderAnimatedDots()}
        </p>
      </div>

      {/* Main Progress Bar */}
      <div 
        className="relative w-full h-2 overflow-hidden border rounded-full shadow-md mx-auto"
        style={{ 
          backgroundColor: '#1e2438',
          borderColor: '#2a3142'
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: currentPhase === 0 
              ? 'linear-gradient(90deg, #6b9bd1 0%, #8ab4e6 100%)'
              : currentPhase === 1 
              ? 'linear-gradient(90deg, #c9a969 0%, #ffd700 100%)'
              : currentPhase === 2 
              ? 'linear-gradient(90deg, #7ec850 0%, #a8e06e 100%)'
              : currentPhase === 3 
              ? 'linear-gradient(90deg, #ff9d5c 0%, #ffc080 100%)'
              : 'linear-gradient(90deg, #e85d75 0%, #ff8fa0 100%)',
            boxShadow: '0 0 8px rgba(201, 169, 105, 0.4)'
          }}
        >
          {/* Animated shine effect */}
          <div 
            className="h-full w-full opacity-30 animate-pulse"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
            }}
          />
        </div>
      </div>

      {/* Progress percentage and time estimate */}
      <div className="flex justify-between items-center mt-3 px-4">
        <p 
          className="text-sm font-semibold"
          style={{ color: '#c9a969' }}
        >
          {Math.round(progress)}%
        </p>
        <p 
          className="text-xs"
          style={{ color: '#8a92b4' }}
        >
          {language === 'en' && 'Usually 8-15 seconds'}
          {language === 'zh-TW' && '通常需要 8-15 秒'}
          {language === 'zh-CN' && '通常需要 8-15 秒'}
          {language === 'ko' && '보통 8-15초 소요'}
        </p>
      </div>

      {/* Sub-progress details */}
      <div className="mt-4 flex gap-1 px-4">
        {currentMessages.map((phase, idx) => (
          <div
            key={idx}
            className="h-1 rounded-full transition-all duration-300 flex-1"
            style={{
              backgroundColor: idx <= currentPhase 
                ? '#c9a969' 
                : '#1e2438',
              border: idx <= currentPhase 
                ? '1px solid #ffd700'
                : '1px solid #2a3142'
            }}
          />
        ))}
      </div>
    </div>
  )
}


export default ProgressBar
