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
      subtitle: '命運已定，生而注定。選擇而生，活出真我。',
      tagline: 'Destiny is fixed, born predetermined. Choose to live, become yourself.',
      error: 'Error'
    },
    'zh-TW': {
      main: 'BAZI AI 命理分析',
      subtitle: '命運已定，生而注定。選擇而生，活出真我。',
      tagline: '用古代智慧和現代AI了解您的人生',
      error: '錯誤'
    },
    'zh-CN': {
      main: 'BAZI AI 命理分析',
      subtitle: '命运已定，生而注定。选择而生，活出真我。',
      tagline: '用古代智慧和现代AI了解您的人生',
      error: '错误'
    }
  }

  const content = titles[language] || titles.en

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-2">✨ {content.main}</h1>
          <p className="text-xl text-purple-200 mb-2">{content.subtitle}</p>
          <p className="text-lg text-purple-100">{content.tagline}</p>
        </div>

        {/* Language Selector */}
        <LanguageSelector 
          language={language} 
          onLanguageChange={setLanguage}
        />

        {/* Main Content Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-800 font-semibold">
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
                    // Reset state by reloading page
                    window.location.href = window.location.href
                  }}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  {language === 'en' && '✨ Analyze Another Person'}
                  {language === 'zh-TW' && '✨ 分析另一個人'}
                  {language === 'zh-CN' && '✨ 分析另一个人'}
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
                className="w-full mt-4 py-2 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                ⏹️ {language === 'en' ? 'Stop Analysis' : language === 'zh-TW' ? '停止分析' : '停止分析'}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-center text-gray-600 text-sm">
            <p>
              {language === 'en' && '🔮 Ancient wisdom meets modern AI. Powered by BAZI methodology and OpenAI GPT-4.'}
              {language === 'zh-TW' && '🔮 古代智慧遇上現代AI。由八字命理學和OpenAI GPT-4驅動。'}
              {language === 'zh-CN' && '🔮 古代智慧遇上现代AI。由八字命理学和OpenAI GPT-4驱动。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
