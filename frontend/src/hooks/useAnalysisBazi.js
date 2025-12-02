import { useState, useCallback } from 'react'
import { streamBaziAnalysis, getBaziChart } from '../api/client'

/**
 * Custom hook for BAZI analysis
 * Handles state management for analysis flow
 */
export const useAnalysisBazi = () => {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [baziChart, setBaziChart] = useState(null)
  const [insights, setInsights] = useState('')
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [abortController, setAbortController] = useState(null)  // ← Changed from eventSource

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

      // Then stream insights
      const controller = await streamBaziAnalysis(
        birthDate,
        birthHour,
        gender,
        language,
        (data) => {
          if (data.type === 'bazi_chart') {
            // Already have this from chartResponse
            console.debug('Received BAZI chart')
          } else if (data.type === 'insight') {
            // Accumulate insight text
            setInsights(prev => prev + (data.text || ''))
          } else if (data.type === 'complete') {
            // Stream complete
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
          setError(err.message || 'Stream connection error')
          setLoading(false)
        }
      )

      setAbortController(controller)

    } catch (err) {
      setError(err.message || 'Analysis failed')
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
    analysisComplete,
    analyzeBazi,
    stopAnalysis
  }
}
