import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useDailyForecast } from '../hooks/useDailyForecast'
import { saveBirthData } from '../api/client'
import { localizeForecastUI, localizeElement } from '../utils/localize'
import FortuneRing from './forecast/FortuneRing'
import DomainBars from './forecast/DomainBars'
import DosAndDonts from './forecast/DosAndDonts'
import LuckyItems from './forecast/LuckyItems'
import EnergyTimeline from './forecast/EnergyTimeline'
import WeeklyTrend from './forecast/WeeklyTrend'
import LockedOverlay from './LockedOverlay'
import InputForm from './InputForm'

const BIRTH_DATA_STORAGE_KEY = 'bazi-birth-data'

/** Persist birth data to localStorage. */
const saveBirthDataLocal = (bd) => {
  try { localStorage.setItem(BIRTH_DATA_STORAGE_KEY, JSON.stringify(bd)) } catch { /* ignore */ }
}

/** Load birth data from localStorage. */
const loadBirthDataLocal = () => {
  try {
    const raw = localStorage.getItem(BIRTH_DATA_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

/**
 * Daily & Weekly Mini-Forecast — main container.
 *
 * Birth data resolution priority:
 *  1. User profile (logged-in user with saved birth data)
 *  2. Current-session baziChart (from Personal Analysis)
 *  3. localStorage (anonymous returning visitors)
 *  4. InputForm (last resort)
 */
export default function DailyForecast({
  baziChart,
  language,
  token,
  isAuthenticated,
  isPremium,
  onUpgradeClick,
}) {
  const { user, refreshUser } = useAuth()
  const { loading, error, rateLimited, forecast, fetchForecast, reset } = useDailyForecast(token)
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10))
  const didAutoFetch = useRef(false)
  // Holds birth data submitted via InputForm (before user/baziChart update)
  const [formBirthData, setFormBirthData] = useState(null)

  // ── Resolve birth data with priority ──────────────────────
  const resolveBirthData = useCallback(() => {
    // 1. User profile (highest priority for logged-in users)
    if (user?.birth_date && user?.birth_hour != null && user?.gender) {
      return {
        birth_date: user.birth_date,
        birth_hour: user.birth_hour,
        gender: user.gender,
        calendar_type: user.calendar_type || 'solar',
        is_leap_month: user.is_leap_month || false,
      }
    }

    // 2. Current-session baziChart
    if (baziChart?.input) {
      return {
        birth_date: baziChart.input.solar_date || baziChart.input.birth_date,
        birth_hour: baziChart.input.birth_hour,
        gender: baziChart.input.gender,
        calendar_type: 'solar',
        is_leap_month: false,
      }
    }

    // 3. Form submission (immediate, before localStorage re-reads)
    if (formBirthData) {
      return formBirthData
    }

    // 4. localStorage fallback (anonymous returning visitors)
    const local = loadBirthDataLocal()
    if (local?.birth_date && local?.birth_hour != null && local?.gender) {
      return local
    }

    return null
  }, [user, baziChart, formBirthData])

  const birthData = resolveBirthData()

  // Auto-fetch when birth data is available (once)
  useEffect(() => {
    if (birthData && !didAutoFetch.current && !forecast && !loading && !error && !rateLimited) {
      didAutoFetch.current = true
      fetchForecast(birthData, language, targetDate)
    }
  }, [birthData, forecast, loading, error, rateLimited, language, targetDate, fetchForecast])

  // Refetch when date changes
  const handleDateChange = useCallback((delta) => {
    const d = new Date(targetDate)
    d.setDate(d.getDate() + delta)
    const newDate = d.toISOString().slice(0, 10)
    setTargetDate(newDate)
    if (birthData) {
      fetchForecast(birthData, language, newDate)
    }
  }, [targetDate, birthData, language, fetchForecast])

  const handleToday = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10)
    setTargetDate(today)
    if (birthData) {
      fetchForecast(birthData, language, today)
    }
  }, [birthData, language, fetchForecast])

  // Form submission for users without prior analysis
  const handleFormSubmit = useCallback(async (birthDate, birthHour, gender, lang, calendarType, isLeapMonth) => {
    const bd = {
      birth_date: birthDate,
      birth_hour: birthHour,
      gender,
      calendar_type: calendarType,
      is_leap_month: isLeapMonth,
    }

    // Immediately make birth data available (fixes loading-state gap for anonymous users)
    setFormBirthData(bd)

    // Always save to localStorage
    saveBirthDataLocal(bd)

    // If logged in, persist to user profile
    if (isAuthenticated && token) {
      try {
        await saveBirthData(bd, token)
        await refreshUser()
      } catch (e) {
        console.warn('Failed to save birth data to profile:', e)
      }
    }

    fetchForecast(bd, language, targetDate)
  }, [language, targetDate, fetchForecast, isAuthenticated, token, refreshUser])

  // Forecast-specific submit button label
  const forecastSubmitLabel = {
    en: 'Get My Daily Forecast',
    'zh-TW': '查看今日運勢',
    'zh-CN': '查看今日运势',
    ko: '오늘의 운세 보기',
  }[language] || 'Get My Daily Forecast'

  const isToday = targetDate === new Date().toISOString().slice(0, 10)
  const domainsLocked = forecast?.domains_locked || false

  // Localized rate-limit messages (same design as Personal Analysis)
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

  // Format display date
  const displayDate = (() => {
    try {
      const d = new Date(targetDate + 'T12:00:00')
      return d.toLocaleDateString(language === 'ko' ? 'ko-KR' : language === 'zh-TW' ? 'zh-TW' : language === 'zh-CN' ? 'zh-CN' : 'en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch { return targetDate }
  })()

  // ── Rate limited: show friendly "Daily Limit Reached" card ──
  if (rateLimited) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-900/30 border-2 border-bazi-gold/40 flex items-center justify-center">
          <svg className="w-10 h-10 text-bazi-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-bazi-gold">{rlText.title}</h3>
        <p className="text-amber-100/80 max-w-md">
          {rlText.body(rateLimited.used, rateLimited.limit)}
        </p>
        <p className="text-amber-100/60 max-w-md text-sm">
          {rlText.comeback}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onUpgradeClick}
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
    )
  }

  // ── No forecast loaded yet: show InputForm (with loading/error feedback) ──
  if (!forecast && !loading) {
    return (
      <div className="animate-fade-in space-y-6">
        {/* Error from a previous fetch attempt */}
        {error && (
          <div className="bg-red-900/40 border-l-4 border-red-500 p-4 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
        <div className="text-center mb-2">
          <p className="text-neutral-400 text-sm">{localizeForecastUI('enterBirth', language)}</p>
        </div>
        <InputForm
          onSubmit={handleFormSubmit}
          loading={loading}
          language={language}
          submitLabel={forecastSubmitLabel}
        />
      </div>
    )
  }

  // ── Loading state (fetch in progress) ──
  if (loading && !forecast) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-2 border-bazi-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-amber-200 text-sm">{localizeForecastUI('analyzingForecast', language)}</span>
        </div>
      </div>
    )
  }

  // ── Forecast loaded: show results with date navigator ──
  return (
    <div className="animate-fade-in space-y-6">
      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => handleDateChange(-1)}
          className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-bazi-gold hover:border-bazi-gold/30 transition"
        >
          ‹
        </button>
        <div className="text-center px-3">
          <p className="text-sm text-amber-100 font-medium">{displayDate}</p>
          {forecast?.daily_pillar && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {forecast.daily_pillar.stem?.name_cn}{forecast.daily_pillar.branch?.name_cn}
              {' '}
              ({localizeElement(forecast.daily_pillar.stem?.element, language)})
            </p>
          )}
        </div>
        <button
          onClick={() => handleDateChange(1)}
          className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-bazi-gold hover:border-bazi-gold/30 transition"
        >
          ›
        </button>
        {!isToday && (
          <button
            onClick={handleToday}
            className="ml-2 text-xs px-3 py-1.5 rounded-full border border-bazi-gold/30 text-bazi-gold hover:bg-bazi-gold/10 transition"
          >
            {localizeForecastUI('today', language)}
          </button>
        )}
      </div>

      {/* Loading state (when navigating dates with existing forecast) */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in">
          <div className="w-10 h-10 border-2 border-bazi-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-amber-200 text-sm">{localizeForecastUI('analyzingForecast', language)}</span>
        </div>
      )}

      {/* Error state (when navigating dates fails) */}
      {error && !loading && (
        <div className="bg-red-900/40 border-l-4 border-red-500 p-4 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Forecast results */}
      {forecast && !loading && (
        <div className="space-y-8">
          {/* Fortune Ring — always free (teaser) */}
          <div className="flex justify-center">
            <FortuneRing score={forecast.overall_score} mood={forecast.mood} language={language} />
          </div>

          {/* Domain Scores */}
          <LockedOverlay isLocked={domainsLocked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <DomainBars
              domains={forecast.domains}
              language={language}
            />
          </LockedOverlay>

          {/* Do's & Don'ts */}
          <LockedOverlay isLocked={domainsLocked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <DosAndDonts dos={forecast.dos} donts={forecast.donts} language={language} />
          </LockedOverlay>

          {/* Lucky Items */}
          <LockedOverlay isLocked={domainsLocked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <LuckyItems lucky={forecast.lucky} language={language} />
          </LockedOverlay>

          {/* Energy Timeline */}
          <LockedOverlay isLocked={domainsLocked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <EnergyTimeline rhythm={forecast.energy_rhythm} language={language} />
          </LockedOverlay>

          {/* Weekly Trend */}
          <LockedOverlay isLocked={domainsLocked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <WeeklyTrend trend={forecast.weekly_trend} language={language} />
          </LockedOverlay>

          {/* Daily Wisdom */}
          <LockedOverlay isLocked={forecast.wisdom_locked} language={language} onUpgradeClick={onUpgradeClick} isAuthenticated={isAuthenticated}>
            <div className="relative overflow-hidden rounded-xl border border-bazi-gold/20 bg-gradient-to-br from-amber-950/40 to-bazi-surface p-5">
              <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-widest mb-2">
                {localizeForecastUI('dailyWisdom', language)}
              </h3>
              <p className="text-amber-100/90 text-sm leading-relaxed italic">
                {forecast.wisdom ? `"${forecast.wisdom}"` : '\u00A0'}
              </p>
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-bazi-gold/5 blur-xl" />
            </div>
          </LockedOverlay>
        </div>
      )}
    </div>
  )
}
