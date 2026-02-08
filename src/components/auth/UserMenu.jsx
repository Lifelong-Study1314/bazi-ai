import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createPortalSession } from '../../api/client'

const labels = {
  en: {
    sign_in: 'Sign In',
    premium: 'PREMIUM',
    free: 'FREE',
    manage: 'Manage Subscription',
    logout: 'Sign Out',
  },
  'zh-TW': {
    sign_in: '登入',
    premium: '高級版',
    free: '免費版',
    manage: '管理訂閱',
    logout: '登出',
  },
  'zh-CN': {
    sign_in: '登录',
    premium: '高级版',
    free: '免费版',
    manage: '管理订阅',
    logout: '退出',
  },
  ko: {
    sign_in: '로그인',
    premium: '프리미엄',
    free: '무료',
    manage: '구독 관리',
    logout: '로그아웃',
  },
}

const UserMenu = ({ language = 'en', onSignInClick }) => {
  const { user, token, isAuthenticated, isPremium, logout } = useAuth()
  const t = labels[language] || labels.en
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!isAuthenticated) {
    return (
      <button
        onClick={onSignInClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-bazi-gold/20 bg-bazi-surface/80 hover:border-bazi-gold/40 text-bazi-gold text-sm font-semibold transition-all duration-200"
      >
        <span className="text-base">◈</span>
        {t.sign_in}
      </button>
    )
  }

  const initial = (user.name || user.email || '?')[0].toUpperCase()

  const handleManage = async () => {
    try {
      const { url } = await createPortalSession(token)
      window.location.href = url
    } catch { /* ignore */ }
    setOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bazi-gold/20 bg-bazi-surface/80 hover:border-bazi-gold/40 transition-all duration-200"
      >
        {/* Avatar circle */}
        <span className="w-7 h-7 rounded-full bg-bazi-gold text-bazi-ink flex items-center justify-center text-xs font-bold">
          {initial}
        </span>
        {/* Tier badge */}
        <span className={`text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
          isPremium ? 'bg-bazi-gold/20 text-bazi-gold' : 'bg-neutral-700 text-neutral-400'
        }`}>
          {isPremium ? t.premium : t.free}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-bazi-surface shadow-2xl overflow-hidden z-50 animate-fade-in">
          {/* Email */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            <p className={`text-[10px] font-bold mt-1 tracking-wider ${isPremium ? 'text-bazi-gold' : 'text-neutral-500'}`}>
              {isPremium ? t.premium : t.free}
            </p>
          </div>

          {/* Actions */}
          <div className="py-1">
            {isPremium && user.stripe_customer_id && (
              <button
                onClick={handleManage}
                className="w-full text-left px-4 py-2.5 text-sm text-amber-100 hover:bg-white/5 transition-colors"
              >
                {t.manage}
              </button>
            )}
            <button
              onClick={() => { logout(); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-300 hover:bg-white/5 transition-colors"
            >
              {t.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
