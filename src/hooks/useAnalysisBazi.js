import { useState, useCallback } from 'react'
import { streamBaziAnalysis, getBaziChart, fetchBaziAnalysisNonStreaming, RateLimitError } from '../api/client'

/**
 * Custom hook for BAZI analysis
 * Handles state management for analysis flow
 */
const TOTAL_SECTIONS = 10 // Chart + 8 AI sections + Insights

const INITIAL_SECTION_STATE = {
  five_elements: null,
  ten_gods: null,
  seasonal_strength: null,
  use_god: null,
  pillar_interactions: null,
  annual_forecast: null,
  current_age_period: null,
  age_periods_timeline: null,
}

export const useAnalysisBazi = (token = null) => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [rateLimited, setRateLimited] = useState(null)  // { used, limit } or null
  const [baziChart, setBaziChart] = useState(null)
  const [insights, setInsights] = useState('')
  const [insightsLocked, setInsightsLocked] = useState(false)
  const [sectionContent, setSectionContent] = useState({ ...INITIAL_SECTION_STATE })
  const [sectionLocked, setSectionLocked] = useState({})  // { [key]: boolean }
  const [sectionErrors, setSectionErrors] = useState({})
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [abortController, setAbortController] = useState(null)

  // Derive completed sections count — count both successful and errored sections as "done"
  const _sectionDone = (key) => !!(sectionContent[key] || sectionErrors[key])
  const sectionsCompleted =
    (baziChart ? 1 : 0) +
    (_sectionDone('five_elements') ? 1 : 0) +
    (_sectionDone('ten_gods') ? 1 : 0) +
    (_sectionDone('seasonal_strength') ? 1 : 0) +
    (_sectionDone('use_god') ? 1 : 0) +
    (_sectionDone('pillar_interactions') ? 1 : 0) +
    (_sectionDone('annual_forecast') ? 1 : 0) +
    (_sectionDone('current_age_period') ? 1 : 0) +
    (_sectionDone('age_periods_timeline') ? 1 : 0) +
    (analysisComplete || insightsLocked ? 1 : 0)

  // Simulate progress bar while streaming
  const startProgressSimulation = useCallback(() => {
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        // Faster at beginning, slower as we approach end
        const increment = Math.random() * (5 - (prev / 20))
        return Math.min(prev + increment, 90)
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const analyzeBazi = useCallback(async (birthDate, birthHour, gender, language = 'en', calendarType = 'solar', isLeapMonth = false) => {
    try {
      setLoading(true)
      setError(null)
      setRateLimited(null)
      setInsights('')
      setInsightsLocked(false)
      setBaziChart(null)
      setSectionContent({ ...INITIAL_SECTION_STATE })
      setSectionLocked({})
      setSectionErrors({})
      setAnalysisComplete(false)

      // Abort previous stream if exists
      if (abortController) {
        abortController.abort()
      }

      // Start progress simulation
      const clearInterval = startProgressSimulation()

      // First, get BAZI chart
      const chartResponse = await getBaziChart(birthDate, birthHour, gender, language, calendarType, isLeapMonth, token)
      
      if (!chartResponse.success) {
        throw new Error(chartResponse.error || 'Failed to calculate BAZI chart')
      }

      setBaziChart(chartResponse)

      // Try streaming first; fallback to non-streaming on failure
      let streamSucceeded = false
      const controller = await streamBaziAnalysis(
        birthDate,
        birthHour,
        gender,
        language,
        calendarType,
        isLeapMonth,
        (data) => {
          if (data.type === 'bazi_chart') {
            if (data.data) setBaziChart(data.data)
          } else if (data.type === 'section') {
            if (data.key) {
              setSectionContent(prev => ({ ...prev, [data.key]: data.content }))
              if (data.is_locked) {
                setSectionLocked(prev => ({ ...prev, [data.key]: true }))
              }
              if (data.error) {
                setSectionErrors(prev => ({ ...prev, [data.key]: data.error }))
              }
            }
          } else if (data.type === 'insight') {
            setInsights(prev => prev + (data.text || ''))
          } else if (data.type === 'insight_locked') {
            // Free user: we received the truncated preview
            setInsights(data.preview || '')
            setInsightsLocked(true)
          } else if (data.type === 'complete') {
            streamSucceeded = true
            clearInterval()
            setProgress(100)
            setAnalysisComplete(true)
            setLoading(false)
          } else if (data.type === 'error') {
            throw new Error(data.message)
          }
        },
        (err) => {
          clearInterval()
          // Rate limit — don't retry, show friendly message
          if (err instanceof RateLimitError || err?.name === 'RateLimitError') {
            setRateLimited({ used: err.used, limit: err.limit })
            setLoading(false)
            return
          }
          if (!streamSucceeded) {
            // SSE fallback: retry with non-streaming
            fetchBaziAnalysisNonStreaming(birthDate, birthHour, gender, language, calendarType, isLeapMonth, token)
              .then((res) => {
                if (res.bazi_chart) setBaziChart(res.bazi_chart)
                if (res.sections) {
                  const contentMap = {}
                  const lockedMap = {}
                  for (const [key, val] of Object.entries(res.sections)) {
                    if (val && typeof val === 'object' && 'text' in val) {
                      contentMap[key] = val.text
                      if (val.is_locked) lockedMap[key] = true
                    } else {
                      contentMap[key] = val
                    }
                  }
                  setSectionContent(prev => ({ ...prev, ...contentMap }))
                  setSectionLocked(prev => ({ ...prev, ...lockedMap }))
                }
                if (res.insights) {
                  if (typeof res.insights === 'object' && 'text' in res.insights) {
                    setInsights(res.insights.text)
                    if (res.insights.is_locked) setInsightsLocked(true)
                  } else {
                    setInsights(res.insights)
                  }
                }
                setSectionErrors({})
                setProgress(100)
                setAnalysisComplete(true)
                setLoading(false)
              })
              .catch((fallbackErr) => {
                if (fallbackErr instanceof RateLimitError || fallbackErr?.name === 'RateLimitError') {
                  setRateLimited({ used: fallbackErr.used, limit: fallbackErr.limit })
                } else {
                  setError(fallbackErr.message || 'Stream connection error')
                }
                setLoading(false)
              })
          } else {
            setError(err.message || 'Stream connection error')
            setLoading(false)
          }
        },
        token
      )

      setAbortController(controller)

    } catch (err) {
      // Rate limit — don't retry, show friendly message
      if (err instanceof RateLimitError || err?.name === 'RateLimitError') {
        setRateLimited({ used: err.used, limit: err.limit })
        setLoading(false)
        return
      }
      // Try SSE fallback on any error
      try {
        const res = await fetchBaziAnalysisNonStreaming(birthDate, birthHour, gender, language, calendarType, isLeapMonth, token)
        if (res.bazi_chart) setBaziChart(res.bazi_chart)
        if (res.sections) {
          const contentMap = {}
          const lockedMap = {}
          for (const [key, val] of Object.entries(res.sections)) {
            if (val && typeof val === 'object' && 'text' in val) {
              contentMap[key] = val.text
              if (val.is_locked) lockedMap[key] = true
            } else {
              contentMap[key] = val
            }
          }
          setSectionContent(prev => ({ ...prev, ...contentMap }))
          setSectionLocked(prev => ({ ...prev, ...lockedMap }))
        }
        if (res.insights) {
          if (typeof res.insights === 'object' && 'text' in res.insights) {
            setInsights(res.insights.text)
            if (res.insights.is_locked) setInsightsLocked(true)
          } else {
            setInsights(res.insights)
          }
        }
        setSectionErrors({})
        setProgress(100)
        setAnalysisComplete(true)
      } catch (fallbackErr) {
        if (fallbackErr instanceof RateLimitError || fallbackErr?.name === 'RateLimitError') {
          setRateLimited({ used: fallbackErr.used, limit: fallbackErr.limit })
        } else {
          setError(fallbackErr.message || err.message || 'Analysis failed')
        }
      }
      setLoading(false)
    }
  }, [abortController, startProgressSimulation, token])

  const stopAnalysis = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setLoading(false)
  }, [abortController])

  return {
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
    totalSections: TOTAL_SECTIONS,
    analyzeBazi,
    stopAnalysis
  }
}
