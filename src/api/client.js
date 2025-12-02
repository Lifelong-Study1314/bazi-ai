import axios from 'axios'

// Determine API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
    const response = await apiClient.get('/health')  // ← Remove /api
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
    const response = await apiClient.post('/bazi-chart', {  // ← Remove /api
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
  
  try {
    const payload = {
      birth_date: birthDate,
      birth_hour: birthHour,
      gender: gender,
      language: language
    }

    const response = await fetch(
      `${API_BASE_URL}/analyze`,  // ← Remove /api
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
    
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Stream error:', err)
      onError(err)
    }
  }
  
  return controller
}

export default apiClient
