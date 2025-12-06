import { useState, useEffect } from 'react'
import LanguageSelector from './components/LanguageSelector'
import InputForm from './components/InputForm'
import ProgressBar from './components/ProgressBar'
import ResultsDisplay from './components/ResultsDisplay'
import { useAnalysisBazi } from './hooks/useAnalysisBazi'
import './styles/globals.css'


function App() {
  const [language, setLanguage] = useState('en')
  const { 
    loading, 
    progress, 
    error, 
    baziChart, 
    insights, 
    analysisComplete,
    analyzeBazi, 
    stopAnalysis 
  } = useAnalysisBazi()


  const titles = {
    en: {
      main: 'BAZI AI Analysis',
      subtitle: 'Destiny is fixed, born predetermined. Choose to live, become yourself.',
      tagline: 'Ancient wisdom meets modern technology',
      error: 'Error',
      stopButton: 'Stop Analysis',
      analyzeButton: '✨ Analyze Another Person',
      footer: '🔮 Ancient wisdom meets modern technology. Powered by BAZI and DeepSeek AI.'
    },
    'zh-TW': {
      main: 'BAZI AI 命理分析',
      subtitle: '命運已定，生而注定。選擇而生，活出真我。',
      tagline: '用古代智慧和現代科技了解您的人生',
      error: '錯誤',
      stopButton: '停止分析',
      analyzeButton: '✨ 分析另一個人',
      footer: '🔮 古代智慧遇上現代科技。由八字命理學和DeepSeek AI驅動。'
    },
    'zh-CN': {
      main: 'BAZI AI 命理分析',
      subtitle: '命运已定，生而注定。选择而生，活出真我。',
      tagline: '用古代智慧和现代科技了解您的人生',
      error: '错误',
      stopButton: '停止分析',
      analyzeButton: '✨ 分析另一个人',
      footer: '🔮 古代智慧遇上现代科技。由八字命理学和DeepSeek AI驱动。'
    }
  }


  const content = titles[language] || titles.en


  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: '#1a2035' }}
    >
      {/* Subtle gradient overlay for visual interest */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at top right, #c9a969, transparent 70%)',
          zIndex: 0
        }}
      />


      <div className="relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 
              className="text-5xl font-bold mb-2"
              style={{ 
                color: '#c9a969',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
              }}
            >
              ✨ {content.main}
            </h1>
            <p 
              className="text-xl mb-2"
              style={{ color: '#f5f1e6' }}
            >
              {content.subtitle}
            </p>
            <p 
              className="text-lg"
              style={{ color: '#a0a8c4' }}
            >
              {content.tagline}
            </p>
          </div>


          {/* Language Selector */}
          <LanguageSelector 
            language={language} 
            onLanguageChange={setLanguage}
          />


          {/* Main Content Container */}
          <div 
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: '#1e2438',
              border: '1px solid #2a3142'
            }}
          >
            <div className="p-8">
              {/* Error Display */}
              {error && (
                <div 
                  className="mb-6 border-l-4 p-4 rounded"
                  style={{ 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderLeftColor: '#dc2626'
                  }}
                >
                  <p 
                    className="font-semibold"
                    style={{ color: '#fca5a5' }}
                  >
                    ⚠️ {content.error}: {error}
                  </p>
                </div>
              )}


              {/* Progress Bar */}
              <ProgressBar 
                progress={progress} 
                loading={loading}
                language={language}
              />


              {/* Show form if not loading or show results if complete */}
              {!loading && !analysisComplete ? (
                <InputForm 
                  onSubmit={analyzeBazi}
                  loading={loading}
                  language={language}
                />
              ) : analysisComplete ? (
                <>
                  <ResultsDisplay 
                    baziChart={baziChart}
                    insights={insights}
                    language={language}
                  />
                  <button
                    onClick={() => {
                      window.location.href = window.location.href
                    }}
                    className="w-full mt-6 py-3 px-4 font-bold rounded-lg hover:shadow-lg transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #c9a969 0%, #b08d57 100%)',
                      color: '#0d1117'
                    }}
                  >
                    {content.analyzeButton}
                  </button>
                </>
              ) : (
                <InputForm 
                  onSubmit={analyzeBazi}
                  loading={loading}
                  language={language}
                />
              )}


              {/* Stop Button (shown when loading) */}
              {loading && (
                <button
                  onClick={stopAnalysis}
                  className="w-full mt-4 py-2 px-4 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  ⏹️ {content.stopButton}
                </button>
              )}
            </div>


            {/* Footer */}
            <div 
              className="px-8 py-4 border-t text-center text-sm"
              style={{ 
                backgroundColor: '#0d1117',
                borderTopColor: '#2a3142',
                color: '#a0a8c4'
              }}
            >
              <p>{content.footer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default App