import axios from 'axios'

// Determine API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/** Build full API URL for an endpoint path. Avoids double /api when base already includes it. */
const buildApiUrl = (endpoint) => {
  const base = API_BASE_URL.replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  if (!base.startsWith('http')) return path
  const apiPath = base.endsWith('/api') ? path.replace(/^\/api/, '') : path
  return `${base}${apiPath.startsWith('/') ? '' : '/'}${apiPath}`
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

/** Helper: build headers with optional auth token. */
const authHeaders = (token) => {
  const h = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

/** Custom error class for rate-limiting so the UI can handle it gracefully. */
export class RateLimitError extends Error {
  constructor(used, limit) {
    super('rate_limited')
    this.name = 'RateLimitError'
    this.used = used
    this.limit = limit
  }
}

/** Check a fetch response for 429 and throw RateLimitError if so. */
const checkRateLimit = async (response) => {
  if (response.status === 429) {
    const body = await response.json().catch(() => ({}))
    throw new RateLimitError(body.used ?? 0, body.limit ?? 0)
  }
}


// ==================== AUTH API ====================

export const authSignup = async (email, password, name = null) => {
  const url = buildApiUrl('/api/auth/signup')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Signup failed (${res.status})`)
  return data // { token, user }
}

export const authLogin = async (email, password) => {
  const url = buildApiUrl('/api/auth/login')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || `Login failed (${res.status})`)
  return data // { token, user }
}

export const authMe = async (token) => {
  const url = buildApiUrl('/api/auth/me')
  const res = await fetch(url, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Session expired')
  return res.json() // User object
}


// ==================== BIRTH DATA API ====================

/**
 * Save birth data to the user profile for auto-loading forecasts.
 */
export const saveBirthData = async (birthData, token) => {
  const url = buildApiUrl('/api/auth/birth-data')
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      birth_date: birthData.birth_date,
      birth_hour: birthData.birth_hour,
      gender: birthData.gender,
      calendar_type: birthData.calendar_type || 'solar',
      is_leap_month: birthData.is_leap_month || false,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save birth data')
  return data // Updated User object
}


// ==================== SUBSCRIPTION API ====================

export const createCheckoutSession = async (token) => {
  const url = buildApiUrl('/api/subscribe/checkout')
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Checkout failed')
  return data // { url }
}

export const createCheckoutSessionOnetime = async (token) => {
  const url = buildApiUrl('/api/subscribe/checkout-onetime')
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Checkout failed')
  return data // { url }
}

export const createPortalSession = async (token) => {
  const url = buildApiUrl('/api/subscribe/portal')
  const res = await fetch(url, { method: 'POST', headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Portal failed')
  return data // { url }
}

export const getSubscriptionStatus = async (token) => {
  const url = buildApiUrl('/api/subscribe/status')
  const res = await fetch(url, { headers: authHeaders(token) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Status check failed')
  return data // { tier, features, stripe_customer_id }
}

/**
 * Health check
 */
export const checkHealth = async () => {
  try {
    const url = buildApiUrl('/api/health')
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`)
  }
}

/**
 * Get BAZI chart without AI insights
 */
export const getBaziChart = async (birthDate, birthHour, gender, language = 'en', calendarType = 'solar', isLeapMonth = false, token = null) => {
  try {
    const url = buildApiUrl('/api/bazi-chart')
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        birth_date: birthDate,
        birth_hour: birthHour,
        gender: gender,
        language: language,
        calendar_type: calendarType,
        is_leap_month: isLeapMonth
      })
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } catch (error) {
    throw new Error(`Failed to get BAZI chart: ${error.message}`)
  }
}

const STREAM_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Non-streaming BAZI analysis (SSE fallback)
 */
export const fetchBaziAnalysisNonStreaming = async (birthDate, birthHour, gender, language = 'en', calendarType = 'solar', isLeapMonth = false, token = null) => {
  const url = buildApiUrl('/api/analyze-sync')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        birth_date: birthDate,
        birth_hour: birthHour,
        gender: gender,
        language: language,
        calendar_type: calendarType,
        is_leap_month: isLeapMonth
      }),
      signal: controller.signal
    })
    await checkRateLimit(response)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Stream BAZI analysis with AI insights using fetch + ReadableStream
 */
export const streamBaziAnalysis = async (
  birthDate, 
  birthHour, 
  gender, 
  language,
  calendarType = 'solar',
  isLeapMonth = false,
  onMessage, 
  onError,
  token = null
) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)
  
  try {
    const payload = {
      birth_date: birthDate,
      birth_hour: birthHour,
      gender: gender,
      language: language,
      calendar_type: calendarType,
      is_leap_month: isLeapMonth
    }

    const url = buildApiUrl('/api/analyze')
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
        signal: controller.signal
      }
    )

    await checkRateLimit(response)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines[lines.length - 1]
      
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim()
        
        if (!line) continue
        
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6)
          
          try {
            const data = JSON.parse(jsonStr)
            onMessage(data)
          } catch (e) {
            console.warn('Failed to parse SSE data:', jsonStr)
          }
        }
      }
    }
    
    clearTimeout(timeoutId)
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name !== 'AbortError') {
      console.error('Stream error:', err)
      onError(err)
    } else {
      onError(new Error('Request timed out. Please try again.'))
    }
  }
  
  return controller
}

/**
 * Compatibility analysis between two people
 */
export const analyzeCompatibility = async (personA, personB, language = 'en', token = null) => {
  const url = buildApiUrl('/api/compatibility')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        person_a: personA,
        person_b: personB,
        language: language
      }),
      signal: controller.signal
    })
    await checkRateLimit(response)
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      throw new Error(errBody.detail || `HTTP ${response.status}`)
    }
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Daily forecast.
 * Birth fields are optional — if omitted, the backend falls back to the
 * authenticated user's saved profile data.
 */
export const fetchDailyForecast = async (birthDate, birthHour, gender, language = 'en', calendarType = 'solar', isLeapMonth = false, targetDate = null, token = null) => {
  const url = buildApiUrl('/api/daily-forecast')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)
  try {
    const body = { language }
    if (birthDate != null) body.birth_date = birthDate
    if (birthHour != null) body.birth_hour = birthHour
    if (gender != null) body.gender = gender
    if (calendarType) body.calendar_type = calendarType
    if (isLeapMonth) body.is_leap_month = isLeapMonth
    if (targetDate) body.target_date = targetDate
    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(body),
      signal: controller.signal
    })
    await checkRateLimit(response)
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      throw new Error(errBody.detail || `HTTP ${response.status}`)
    }
    return response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

export default apiClient
