import { useState, useCallback } from 'react'
import { streamBaziAnalysis, getBaziChart, fetchBaziAnalysisNonStreaming } from '../api/client'

/**
 * Custom hook for BAZI analysis
 * Handles state management for analysis flow
 */
const TOTAL_SECTIONS = 8 // Chart + 6 AI sections + Insights

export const useAnalysisBazi = () => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [baziChart, setBaziChart] = useState(null)
  const [insights, setInsights] = useState('')
  const [sectionContent, setSectionContent] = useState({
    five_elements: null,
    ten_gods: null,
    seasonal_strength: null,
    annual_forecast: null,
    current_age_period: null,
    age_periods_timeline: null
  })
  const [sectionErrors, setSectionErrors] = useState({})
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [abortController, setAbortController] = useState(null)

  // Derive completed sections count (1=chart, 2-7=AI sections, 8=insights)
  const sectionsCompleted =
    (baziChart ? 1 : 0) +
    (sectionContent.five_elements ? 1 : 0) +
    (sectionContent.ten_gods ? 1 : 0) +
    (sectionContent.seasonal_strength ? 1 : 0) +
    (sectionContent.annual_forecast ? 1 : 0) +
    (sectionContent.current_age_period ? 1 : 0) +
    (sectionContent.age_periods_timeline ? 1 : 0) +
    (analysisComplete ? 1 : 0)

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

  const analyzeBazi = useCallback(async (birthDate, birthHour, gender, language = 'en') => {
    try {
      setLoading(true)
      setError(null)
      setInsights('')
      setBaziChart(null)
      setSectionContent({
        five_elements: null,
        ten_gods: null,
        seasonal_strength: null,
        annual_forecast: null,
        current_age_period: null,
        age_periods_timeline: null
      })
      setSectionErrors({})
      setAnalysisComplete(false)

      // Abort previous stream if exists
      if (abortController) {
        abortController.abort()
      }

      // Start progress simulation
      const clearInterval = startProgressSimulation()

      // First, get BAZI chart
      const chartResponse = await getBaziChart(birthDate, birthHour, gender, language)
      
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
        (data) => {
          if (data.type === 'bazi_chart') {
            if (data.data) setBaziChart(data.data)
          } else if (data.type === 'section') {
            if (data.key) {
              setSectionContent(prev => ({ ...prev, [data.key]: data.content }))
              if (data.error) {
                setSectionErrors(prev => ({ ...prev, [data.key]: data.error }))
              }
            }
          } else if (data.type === 'insight') {
            setInsights(prev => prev + (data.text || ''))
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
          if (!streamSucceeded) {
            // SSE fallback: retry with non-streaming
            fetchBaziAnalysisNonStreaming(birthDate, birthHour, gender, language)
              .then((res) => {
                if (res.bazi_chart) setBaziChart(res.bazi_chart)
                if (res.sections) setSectionContent(prev => ({ ...prev, ...res.sections }))
                if (res.insights) setInsights(res.insights)
                setSectionErrors({})
                setProgress(100)
                setAnalysisComplete(true)
                setLoading(false)
              })
              .catch((fallbackErr) => {
                setError(fallbackErr.message || 'Stream connection error')
                setLoading(false)
              })
          } else {
            setError(err.message || 'Stream connection error')
            setLoading(false)
          }
        }
      )

      setAbortController(controller)

    } catch (err) {
      // Try SSE fallback on any error
      try {
        const res = await fetchBaziAnalysisNonStreaming(birthDate, birthHour, gender, language)
        if (res.bazi_chart) setBaziChart(res.bazi_chart)
        if (res.sections) setSectionContent(prev => ({ ...prev, ...res.sections }))
        if (res.insights) setInsights(res.insights)
        setSectionErrors({})
        setProgress(100)
        setAnalysisComplete(true)
      } catch (fallbackErr) {
        setError(fallbackErr.message || err.message || 'Analysis failed')
      }
      setLoading(false)
    }
  }, [abortController, startProgressSimulation])

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
    baziChart,
    insights,
    sectionContent,
    sectionErrors,
    analysisComplete,
    sectionsCompleted,
    totalSections: TOTAL_SECTIONS,
    analyzeBazi,
    stopAnalysis
  }
}
