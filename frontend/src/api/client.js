import axios from 'axios'

// Determine API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0,  // ✅ CHANGED: No timeout (critical for streaming)
  headers: {
    'Content-Type': 'application/json',
  }
})

/**
 * Health check
 */
export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health')
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
    const response = await apiClient.post('/bazi-chart', {
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
 * 
 * This replaces EventSource because:
 * 1. We need to send POST request (EventSource only does GET)
 * 2. Fetch API has better control over streaming
 * 3. Works better with CORS and headers
 * 
 * Usage:
 * const controller = await streamBaziAnalysis(
 *   '1990-05-15', 14, 'male', 'en',
 *   (data) => console.log('Received:', data),
 *   (error) => console.error('Error:', error)
 * )
 * 
 * Returns AbortController, call controller.abort() to stop
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
    // Prepare request body
    const payload = {
      birth_date: birthDate,
      birth_hour: birthHour,
      gender: gender,
      language: language
    }

    // Make fetch request with streaming
    const response = await fetch(
      `${API_BASE_URL}/analyze`,
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

    // Read streaming response
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      // Decode chunk
      buffer += decoder.decode(value, { stream: true })
      
      // Parse Server-Sent Events format
      const lines = buffer.split('\n')
      
      // Keep last incomplete line in buffer
      buffer = lines[lines.length - 1]
      
      // Process complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim()
        
        // Skip empty lines
        if (!line) continue
        
        // Parse SSE format: "data: {json}"
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6)  // Remove "data: " prefix
          
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