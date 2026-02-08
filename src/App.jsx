import { useState, useEffect, useRef } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { saveBirthData } from './api/client'
import LanguageSelector from './components/LanguageSelector'
import InputForm from './components/InputForm'
import ProgressBar from './components/ProgressBar'
import ResultsDisplay from './components/ResultsDisplay'
import CompatibilityForm from './components/CompatibilityForm'
import CompatibilityDisplay from './components/CompatibilityDisplay'
import DailyForecast from './components/DailyForecast'
import AuthModal from './components/auth/AuthModal'
import UserMenu from './components/auth/UserMenu'
import PricingModal from './components/auth/PricingModal'
import { useAnalysisBazi } from './hooks/useAnalysisBazi'
import { useCompatibility } from './hooks/useCompatibility'
import './styles/globals.css'

function AppContent() {
  const [language, setLanguage] = useState('en')
  const [mode, setMode] = useState('personal') // 'personal' | 'compatibility' | 'forecast'
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('login')
  const [pricingModalOpen, setPricingModalOpen] = useState(false)

  const { token, isAuthenticated, isPremium, refreshUser } = useAuth()

  // Check for Stripe checkout success/cancel in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      refreshUser()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (params.get('checkout') === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [refreshUser])

  const { 
    loading, 
    progress, 
    error, 
    rateLimited,
    baziChart, 
    insights, 
    insightsLocked,
    sectionContent,
    sectionLocked,
    sectionErrors,
    analysisComplete,
    sectionsCompleted,
    totalSections,
    analyzeBazi, 
    stopAnalysis
  } = useAnalysisBazi(token)

  // Auto-save birth data to user profile + localStorage after a successful personal analysis
  const didSaveBirthRef = useRef(null) // tracks which chart input we already saved
  useEffect(() => {
    if (!baziChart?.input) return
    const inp = baziChart.input
    const birthKey = `${inp.birth_date || inp.solar_date}|${inp.birth_hour}|${inp.gender}`
    if (didSaveBirthRef.current === birthKey) return // already saved for this chart
    didSaveBirthRef.current = birthKey

    const bd = {
      birth_date: inp.solar_date || inp.birth_date,
      birth_hour: inp.birth_hour,
      gender: inp.gender,
      calendar_type: 'solar',
      is_leap_month: false,
    }

    // Save to localStorage (for anonymous users / cross-tab convenience)
    try { localStorage.setItem('bazi-birth-data', JSON.stringify(bd)) } catch { /* ignore */ }

    // Save to user profile if logged in
    if (isAuthenticated && token) {
      saveBirthData(bd, token)
        .then(() => refreshUser())
        .catch((e) => console.warn('Auto-save birth data failed:', e))
    }
  }, [baziChart, isAuthenticated, token, refreshUser])

  const {
    loading: compatLoading,
    error: compatError,
    rateLimited: compatRateLimited,
    result: compatResult,
    analyze: analyzeCompat,
    reset: resetCompat,
  } = useCompatibility(token)

  // Handlers for gating overlays
  const handleUpgradeClick = () => {
    if (!isAuthenticated) {
      setAuthModalTab('signup')
      setAuthModalOpen(true)
    } else {
      setPricingModalOpen(true)
    }
  }

  const titles = {
    en: {
      main: 'BAZI AI Analysis',
      motto: '命運已定，生而注定。選擇而生，活出真我。',
      subtitle: 'Destiny is fixed, born predetermined. Choose to live, become yourself.',
      tagline: 'Ancient wisdom meets modern AI to illuminate your life path.',
      error: 'Error'
    },
    'zh-TW': {
      main: 'BAZI AI 命理分析',
      motto: '命運已定，生而注定。選擇而生，活出真我。',
      subtitle: '用古代智慧和現代AI了解您的人生',
      tagline: '',
      error: '錯誤'
    },
    'zh-CN': {
      main: 'BAZI AI 命理分析',
      motto: '命运已定，生而注定。选择而生，活出真我。',
      subtitle: '用古代智慧和现代AI了解您的人生',
      tagline: '',
      error: '错误'
    },
    ko: {
      main: 'BAZI AI 사주 분석',
      motto: '命運已定，生而注定。選擇而生，活出真我。',
      subtitle: '고대 지혜와 현대 AI로 당신의 인생을 알아보세요',
      tagline: '',
      error: '오류'
    }
  }

  const modeLabels = {
    en: { personal: 'Personal Analysis', compatibility: 'Compatibility', forecast: 'Daily Forecast' },
    'zh-TW': { personal: '個人分析', compatibility: '合婚分析', forecast: '每日運勢' },
    'zh-CN': { personal: '个人分析', compatibility: '合婚分析', forecast: '每日运势' },
    ko: { personal: '개인 분석', compatibility: '궁합 분석', forecast: '오늘의 운세' },
  }

  const content = titles[language] || titles.en
  const modeLabel = modeLabels[language] || modeLabels.en

  const howToReadMap = { en: 'How to read this chart', 'zh-TW': '如何閱讀此命盤解析', 'zh-CN': '如何阅读此命盘解析', ko: '이 사주 해석 읽는 법' }
  const analyzeBtnMap = { en: 'Analyze Another Person', 'zh-TW': '分析另一個人', 'zh-CN': '分析另一个人', ko: '다른 사람 분석하기' }
  const stopBtnMap = { en: 'Stop Analysis', 'zh-TW': '停止分析', 'zh-CN': '停止分析', ko: '분석 중지' }
  const tryAgainMap = { en: 'Analyze Another Pair', 'zh-TW': '分析另一對', 'zh-CN': '分析另一对', ko: '다른 커플 분석하기' }
  const footerMap = {
    en: 'Ancient wisdom, modern AI. Powered by BAZI methodology.',
    'zh-TW': '古老命理結合現代AI，由八字命理學提供根基。',
    'zh-CN': '古老命理结合现代AI，由八字命理学提供根基。',
    ko: '고대 지혜와 현대 AI. 사주 명리학 기반.',
  }

  const currentError = mode === 'personal' ? error : mode === 'compatibility' ? compatError : null
  const currentRateLimited = mode === 'personal' ? rateLimited : mode === 'compatibility' ? compatRateLimited : null
  const isLoading = mode === 'personal' ? loading : mode === 'compatibility' ? compatLoading : false

  // Localized rate-limit messages
  const rateLimitText = {
    en: {
      title: 'Daily Limit Reached',
      body: (used, limit) => `You have used all ${limit} free analyses for today.`,
      comeback: 'Come back tomorrow for more free readings, or upgrade to Premium for unlimited analyses.',
      upgrade: 'Upgrade to Premium',
      tryTomorrow: 'Try Again Tomorrow',
    },
    'zh-TW': {
      title: '今日免費次數已用完',
      body: (used, limit) => `您今日已使用 ${limit} 次免費分析。`,
      comeback: '明天再來獲取更多免費解讀，或升級高級版享受無限次分析。',
      upgrade: '升級高級版',
      tryTomorrow: '明天再試',
    },
    'zh-CN': {
      title: '今日免费次数已用完',
      body: (used, limit) => `您今日已使用 ${limit} 次免费分析。`,
      comeback: '明天再来获取更多免费解读，或升级高级版享受无限次分析。',
      upgrade: '升级高级版',
      tryTomorrow: '明天再试',
    },
    ko: {
      title: '오늘의 무료 분석 횟수를 모두 사용했습니다',
      body: (used, limit) => `오늘 ${limit}회의 무료 분석을 모두 사용하셨습니다.`,
      comeback: '내일 다시 오시거나, 프리미엄으로 업그레이드하여 무제한 분석을 이용하세요.',
      upgrade: '프리미엄 업그레이드',
      tryTomorrow: '내일 다시 시도',
    },
  }
  const rlText = rateLimitText[language] || rateLimitText.en

  return (
    <div className="min-h-screen bg-bazi-bg text-amber-50 py-12 md:py-16 px-6 md:px-8 relative">
      {/* Top-right user menu — fixed on scroll */}
      <div className="fixed top-4 right-4 z-40">
        <UserMenu
          language={language}
          onSignInClick={() => { setAuthModalTab('login'); setAuthModalOpen(true) }}
        />
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-bazi-gold focus:text-bazi-ink focus:rounded-lg">
        Skip to main content
      </a>
      <div className="max-w-5xl mx-auto" id="main-content">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-bazi-gold mb-3 font-serif-cjk tracking-wide">
            {content.main}
          </h1>
          <p className="text-sm text-bazi-gold/50 mb-2 font-serif-cjk tracking-widest">
            {content.motto}
          </p>
          <p className="text-base md:text-lg text-amber-100 mb-1 font-medium">
            {content.subtitle}
          </p>
          {content.tagline && (
            <p className="text-sm md:text-base text-neutral-400">
              {content.tagline}
            </p>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 flex-wrap">
          <LanguageSelector 
            language={language} 
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-white/10 bg-bazi-surface/80 p-1 flex-wrap">
            {['personal', 'compatibility', 'forecast'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`
                  px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${mode === m
                    ? 'bg-bazi-gold text-bazi-ink shadow-lg'
                    : 'text-neutral-400 hover:text-amber-200'
                  }
                `}
              >
                {m === 'personal' ? '☯ ' : m === 'compatibility' ? '⬡ ' : '☀ '}
                {modeLabel[m]}
              </button>
            ))}
          </div>
        </div>

        {/* How to read this chart — only in personal mode */}
        {mode === 'personal' && (
          <div className="mt-4 mb-8 rounded-xl border border-white/5 bg-bazi-surface-soft/80 px-6 py-5 shadow-card">
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
        )}

        {/* Main Content Container */}
        <div className="bg-bazi-surface rounded-xl border border-white/5 shadow-card overflow-hidden">
          <div className="p-6 md:p-8 lg:p-10">
            {/* Rate Limit Display — friendly card replaces the form/results */}
            {currentRateLimited && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6 animate-fade-in">
                {/* Decorative icon */}
                <div className="w-20 h-20 rounded-full bg-amber-900/30 border-2 border-bazi-gold/40 flex items-center justify-center">
                  <svg className="w-10 h-10 text-bazi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-bazi-gold">{rlText.title}</h3>
                <p className="text-amber-100/80 max-w-md">
                  {rlText.body(currentRateLimited.used, currentRateLimited.limit)}
                </p>
                <p className="text-amber-100/60 max-w-md text-sm">
                  {rlText.comeback}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleUpgradeClick}
                    className="px-8 py-3 bg-gradient-to-r from-bazi-gold to-amber-500 text-bazi-ink font-bold rounded-button shadow-card hover:shadow-lg transition-all duration-200"
                  >
                    {rlText.upgrade}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 border border-bazi-gold/30 text-bazi-gold rounded-button hover:bg-bazi-gold/10 transition-all duration-200"
                  >
                    {rlText.tryTomorrow}
                  </button>
                </div>
              </div>
            )}

            {/* Error Display (non-rate-limit errors) */}
            {!currentRateLimited && currentError && (
              <div className="mb-6 bg-red-900/40 border-l-4 border-bazi-red p-4 rounded">
                <p className="text-red-100 font-semibold">
                  <span className="text-bazi-gold">⚠</span> {content.error}: {currentError}
                </p>
              </div>
            )}

            {/* ===== PERSONAL MODE ===== */}
            {!currentRateLimited && mode === 'personal' && (
              <>
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
                      insightsLocked={insightsLocked}
                      sectionContent={sectionContent}
                      sectionLocked={sectionLocked}
                      sectionErrors={sectionErrors}
                      language={language}
                      loading={loading}
                      isAuthenticated={isAuthenticated}
                      isPremium={isPremium}
                      onUpgradeClick={handleUpgradeClick}
                      onRetry={() => {
                        // Re-run analysis with the same input data from the current chart
                        if (baziChart?.input) {
                          const inp = baziChart.input
                          analyzeBazi(
                            inp.solar_date || inp.birth_date,
                            inp.birth_hour,
                            inp.gender,
                            language,
                            inp.calendar_type || 'solar',
                            inp.is_leap_month || false,
                          )
                        }
                      }}
                      analysisComplete={analysisComplete}
                    />
                    {analysisComplete && (
                      <button
                        onClick={() => { window.location.href = window.location.href }}
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
                    ■ {stopBtnMap[language] || stopBtnMap.en}
                  </button>
                )}
              </>
            )}

            {/* ===== COMPATIBILITY MODE ===== */}
            {!currentRateLimited && mode === 'compatibility' && (
              <>
                {compatLoading && (
                  <div className="mb-6 text-center animate-fade-in">
                    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-neutral-800/60 border border-white/5">
                      <div className="w-5 h-5 border-2 border-bazi-gold border-t-transparent rounded-full animate-spin" />
                      <span className="text-amber-200 font-medium">
                        {language === 'en' ? 'Analyzing compatibility...' : language === 'zh-TW' ? '分析合婚中...' : language === 'zh-CN' ? '分析合婚中...' : '궁합 분석 중...'}
                      </span>
                    </div>
                  </div>
                )}

                {!compatResult ? (
                  <CompatibilityForm
                    onSubmit={analyzeCompat}
                    loading={compatLoading}
                    language={language}
                  />
                ) : (
                  <>
                    <CompatibilityDisplay
                      result={compatResult}
                      language={language}
                      isAuthenticated={isAuthenticated}
                      isPremium={isPremium}
                      onUpgradeClick={handleUpgradeClick}
                    />
                    <button
                      onClick={resetCompat}
                      className="w-full mt-8 py-3 px-6 bg-bazi-gold text-bazi-ink font-bold rounded-button hover:bg-bazi-gold-soft transition-all duration-200 shadow-card"
                    >
                      {tryAgainMap[language] || tryAgainMap.en}
                    </button>
                  </>
                )}
              </>
            )}

            {/* ===== FORECAST MODE ===== */}
            {mode === 'forecast' && (
              <DailyForecast
                baziChart={baziChart}
                language={language}
                token={token}
                isAuthenticated={isAuthenticated}
                isPremium={isPremium}
                onUpgradeClick={handleUpgradeClick}
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-bazi-surface-soft px-8 py-5 border-t border-white/5 text-center text-neutral-400 text-xs md:text-sm">
            <p>
              <span className="text-bazi-gold">◈</span> {footerMap[language] || footerMap.en}
            </p>
          </div>
        </div>
      </div>

      {/* Auth & Pricing Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        language={language}
        initialTab={authModalTab}
      />
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        language={language}
        onNeedAuth={() => { setAuthModalTab('signup'); setAuthModalOpen(true) }}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
