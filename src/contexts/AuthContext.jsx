import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authLogin, authSignup, authMe } from '../api/client'

const STORAGE_KEY = 'bazi-auth-token'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || null } catch { return null }
  })
  const [loading, setLoading] = useState(!!token) // true if restoring session

  const isAuthenticated = !!user
  const isPremium = user?.tier === 'premium'

  // Persist / clear token
  const saveToken = useCallback((t) => {
    setToken(t)
    try {
      if (t) localStorage.setItem(STORAGE_KEY, t)
      else localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore */ }
  }, [])

  // Restore session on mount
  useEffect(() => {
    if (!token) { setLoading(false); return }
    authMe(token)
      .then(u => { setUser(u); setLoading(false) })
      .catch(() => { saveToken(null); setUser(null); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const data = await authLogin(email, password)
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }, [saveToken])

  const signup = useCallback(async (email, password, name) => {
    const data = await authSignup(email, password, name)
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }, [saveToken])

  const logout = useCallback(() => {
    saveToken(null)
    setUser(null)
  }, [saveToken])

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const u = await authMe(token)
      setUser(u)
    } catch { /* ignore */ }
  }, [token])

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated, isPremium,
      login, signup, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
