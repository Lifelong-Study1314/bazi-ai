import React from 'react'

const ctaLabels = {
  en: { title: 'Unlock Full Reading', btn: 'Upgrade to Premium', login: 'Sign in to unlock' },
  'zh-TW': { title: '解鎖完整解讀', btn: '升級至高級版', login: '登入以解鎖' },
  'zh-CN': { title: '解锁完整解读', btn: '升级至高级版', login: '登录以解锁' },
  ko: { title: '전체 분석 잠금 해제', btn: '프리미엄으로 업그레이드', login: '로그인하여 잠금 해제' },
}

/**
 * Wraps content and overlays a blur + CTA when `isLocked` is true.
 * 
 * Props:
 * - isLocked: boolean
 * - language: string
 * - onUpgradeClick: () => void  — opens PricingModal or AuthModal
 * - isAuthenticated: boolean
 * - children: ReactNode (the truncated preview content)
 */
const LockedOverlay = ({ isLocked, language = 'en', onUpgradeClick, isAuthenticated = false, children }) => {
  const t = ctaLabels[language] || ctaLabels.en

  if (!isLocked) return <>{children}</>

  return (
    <div className="relative">
      {/* Truncated preview */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: '6em',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      >
        {children}
      </div>

      {/* Blur overlay with CTA */}
      <div className="relative mt-1 flex flex-col items-center justify-center py-8 rounded-xl border border-bazi-gold/10 bg-neutral-900/60 backdrop-blur-sm">
        <span className="text-bazi-gold text-3xl mb-3">◈</span>
        <p className="text-amber-100 font-semibold text-sm mb-1">{t.title}</p>
        <button
          onClick={onUpgradeClick}
          className="mt-3 px-6 py-2.5 bg-bazi-gold text-bazi-ink font-bold text-sm rounded-lg hover:bg-bazi-gold-soft transition-all duration-200 shadow-lg"
        >
          {isAuthenticated ? t.btn : t.login}
        </button>
      </div>
    </div>
  )
}

export default LockedOverlay
