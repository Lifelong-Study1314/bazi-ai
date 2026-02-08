import { useState, useCallback } from 'react'
import { analyzeCompatibility, RateLimitError } from '../api/client'

/**
 * Custom hook for BAZI compatibility analysis
 */
export const useCompatibility = (token = null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rateLimited, setRateLimited] = useState(null) // { used, limit } or null
  const [result, setResult] = useState(null)

  const analyze = useCallback(async (personA, personB, language = 'en') => {
    try {
      setLoading(true)
      setError(null)
      setRateLimited(null)
      setResult(null)

      const data = await analyzeCompatibility(personA, personB, language, token)

      if (!data.success) {
        throw new Error(data.error || 'Compatibility analysis failed')
      }

      setResult(data)
    } catch (err) {
      if (err instanceof RateLimitError || err?.name === 'RateLimitError') {
        setRateLimited({ used: err.used, limit: err.limit })
      } else {
        setError(err.message || 'Analysis failed')
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setRateLimited(null)
    setResult(null)
  }, [])

  return {
    loading,
    error,
    rateLimited,
    result,
    analyze,
    reset,
  }
}
