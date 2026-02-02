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

/**
 * Health check
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/api/health')
    return response.data
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`)
  }
}

/**
 * Get BAZI chart without AI insights
 */
export const getBaziChart = async (birthDate, birthHour, gender, language = 'en') => {
  try {
    const response = await apiClient.post('/api/bazi-chart', {
      birth_date: birthDate,
      birth_hour: birthHour,
      gender: gender,
      language: language
    })
    return response.data
  } catch (error) {
    throw new Error(`Failed to get BAZI chart: ${error.message}`)
  }
}

const STREAM_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Non-streaming BAZI analysis (SSE fallback)
 */
export const fetchBaziAnalysisNonStreaming = async (birthDate, birthHour, gender, language = 'en') => {
  const url = buildApiUrl('/api/analyze-sync')
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birth_date: birthDate,
        birth_hour: birthHour,
        gender: gender,
        language: language
      }),
      signal: controller.signal
    })
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
  onMessage, 
  onError
) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)
  
  try {
    const payload = {
      birth_date: birthDate,
      birth_hour: birthHour,
      gender: gender,
      language: language
    }

    const url = buildApiUrl('/api/analyze')
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }
    )

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

export default apiClient
