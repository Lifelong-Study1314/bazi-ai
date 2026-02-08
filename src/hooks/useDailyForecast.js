import { useState, useCallback } from 'react'
import { fetchDailyForecast, RateLimitError } from '../api/client'

/**
 * Custom hook for daily/weekly mini-forecast
 */
export const useDailyForecast = (token = null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rateLimited, setRateLimited] = useState(null)
  const [forecast, setForecast] = useState(null)

  const fetchForecast = useCallback(async (birthData, language = 'en', targetDate = null) => {
    try {
      setLoading(true)
      setError(null)
      setRateLimited(null)

      const data = await fetchDailyForecast(
        birthData.birth_date,
        birthData.birth_hour,
        birthData.gender,
        language,
        birthData.calendar_type || 'solar',
        birthData.is_leap_month || false,
        targetDate,
        token,
      )

      if (!data.success) {
        throw new Error(data.error || 'Forecast failed')
      }

      setForecast(data)
    } catch (err) {
      if (err instanceof RateLimitError || err?.name === 'RateLimitError') {
        setRateLimited({ used: err.used, limit: err.limit })
      } else {
        setError(err.message || 'Forecast failed')
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setRateLimited(null)
    setForecast(null)
  }, [])

  return { loading, error, rateLimited, forecast, fetchForecast, reset }
}
