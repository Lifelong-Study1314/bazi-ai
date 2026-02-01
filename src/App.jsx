import { useState } from 'react'
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
    sectionContent,
    sectionErrors,
    analysisComplete,
    sectionsCompleted,
    totalSections,
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
    },
    ko: {
      main: 'BAZI AI 사주 분석',
      subtitle: '운명은 정해졌고, 태어나면서 정해진다. 선택하며 살고, 진정한 나를 살아간다.',
      tagline: '고대 지혜와 현대 AI로 당신의 인생을 알아보세요',
      error: '오류'
    }
  }

  const content = titles[language] || titles.en

  const howToReadMap = { en: 'How to read this chart', 'zh-TW': '如何閱讀此命盤解析', 'zh-CN': '如何阅读此命盘解析', ko: '이 사주 해석 읽는 법' }
  const analyzeBtnMap = { en: '✨ Analyze Another Person', 'zh-TW': '✨ 分析另一個人', 'zh-CN': '✨ 分析另一个人', ko: '✨ 다른 사람 분석하기' }
  const stopBtnMap = { en: 'Stop Analysis', 'zh-TW': '停止分析', 'zh-CN': '停止分析', ko: '분석 중지' }
  const footerMap = {
    en: '🔮 Ancient wisdom, modern AI. Powered by BAZI methodology.',
    'zh-TW': '🔮 古老命理結合現代AI，由八字命理學提供根基。',
    'zh-CN': '🔮 古老命理结合现代AI，由八字命理学提供根基。',
    ko: '🔮 고대 지혜와 현대 AI. 사주 명리학 기반.',
  }

  return (
    <div className="min-h-screen bg-bazi-bg text-amber-50 py-12 md:py-16 px-6 md:px-8">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-bazi-gold focus:text-bazi-ink focus:rounded-lg">
        Skip to main content
      </a>
      <div className="max-w-5xl mx-auto" id="main-content">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-bazi-gold mb-4 font-serif-cjk tracking-wide">
            {content.main}
          </h1>
          <p className="text-base md:text-lg text-amber-100 mb-2 font-serif-cjk font-medium">
            {content.subtitle}
          </p>
          <p className="text-sm md:text-base text-neutral-400">
            {content.tagline}
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 flex-wrap">
          <LanguageSelector 
            language={language} 
            onLanguageChange={setLanguage}
          />
        </div>

        {/* How to read this chart */}
        <div className="mt-8 mb-8 rounded-xl border border-white/5 bg-bazi-surface-soft/80 px-6 py-5 shadow-card">
          <h2 className="text-lg font-semibold text-amber-100 mb-3">
            {howToReadMap[language] || howToReadMap.en}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-400 text-sm">
            {language === 'en' && (
              <>
                <li>The Day Master is your core self; the Four Pillars show the environment you are born into.</li>
                <li>Ten-year luck periods describe the atmosphere of each decade rather than fixed events.</li>
                <li>Auspicious decades are good for expansion; challenging ones are for consolidation and inner work.</li>
              </>
            )}
            {language === 'zh-TW' && (
              <>
                <li>日主代表你的「本體能量」，四柱則是你出生時的整體氣場。</li>
                <li>十年大運描述的是每十年的運勢氛圍，而非絕對事件。</li>
                <li>吉運適合拓展與行動，較具挑戰的大運則適合調整、收斂與內在修行。</li>
              </>
            )}
            {language === 'zh-CN' && (
              <>
                <li>日主代表你的核心能量，四柱则是你出生时的整体气场。</li>
                <li>十年大运描述的是每十年的运势氛围，而不是绝对会发生的事件。</li>
                <li>顺势的大运适合扩展与行动，较具挑战的大运更适合调整、收敛与内在修行。</li>
              </>
            )}
            {language === 'ko' && (
              <>
                <li>일주는 당신의 핵심 에너지를 나타내며, 사주는 태어날 때의 전체 기운을 보여줍니다.</li>
                <li>십년 대운은 각 시기의 운세 분위기를 설명하며, 고정된 사건이 아닙니다.</li>
                <li>길운은 확장과 행동에 적합하고, 도전적인 대운은 조정과 내면 수양에 적합합니다.</li>
              </>
            )}
          </ul>
        </div>

        {/* Main Content Container */}
        <div className="bg-bazi-surface rounded-xl border border-white/5 shadow-card overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-900/40 border-l-4 border-bazi-red p-4 rounded">
                <p className="text-red-100 font-semibold">
                  ⚠️ {content.error}: {error}
                </p>
              </div>
            )}

            {/* Progress Bar - shown during loading */}
            <ProgressBar 
              progress={progress} 
              loading={loading}
              language={language}
              sectionsCompleted={sectionsCompleted}
              totalSections={totalSections}
            />

            {/* Show form when no chart yet; show results progressively when chart available */}
            {!baziChart ? (
              <InputForm 
                onSubmit={analyzeBazi}
                loading={loading}
                language={language}
              />
            ) : (
              <>
                <ResultsDisplay 
                  baziChart={baziChart}
                  insights={insights}
                  sectionContent={sectionContent}
                  sectionErrors={sectionErrors}
                  language={language}
                  loading={loading}
                />
                {analysisComplete && (
                  <button
                    onClick={() => {
                      window.location.href = window.location.href
                    }}
                    className="w-full mt-8 py-3 px-6 bg-bazi-gold text-bazi-ink font-bold rounded-button hover:bg-bazi-gold-soft transition-all duration-200 shadow-card"
                  >
                    {analyzeBtnMap[language] || analyzeBtnMap.en}
                  </button>
                )}
              </>
            )}

            {/* Stop Button (shown when loading) */}
            {loading && (
              <button
                onClick={stopAnalysis}
                className="w-full mt-6 py-2 px-6 bg-bazi-red text-white font-semibold rounded-button hover:bg-red-600 transition-all duration-200"
              >
                ⏹️ {stopBtnMap[language] || stopBtnMap.en}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="bg-bazi-surface-soft px-8 py-5 border-t border-white/5 text-center text-neutral-400 text-xs md:text-sm">
            <p>
              {footerMap[language] || footerMap.en}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
