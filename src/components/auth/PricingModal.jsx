import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createCheckoutSession, createCheckoutSessionOnetime } from '../../api/client'

const labels = {
  en: {
    title: 'Unlock Your Full BAZI Reading',
    subtitle: 'Get complete, untruncated AI insights for all sections.',
    free_title: 'Free',
    free_price: '$0',
    premium_title: 'Premium',
    premium_price: 'Subscribe',
    free_features: [
      'BAZI chart (Four Pillars)',
      'Five Elements wheel',
      'Preview of all AI insights (3 lines)',
      '3 analyses per day',
    ],
    premium_features: [
      'Everything in Free',
      'Full AI insights for all sections',
      'Full Compatibility AI insight',
      'Unlimited analyses',
      'PDF Export (coming soon)',
      'Saved History (coming soon)',
    ],
    subscribe: 'Subscribe Now',
    subscribe_recurring: 'Subscribe (Card, recurring)',
    pay_once_31: 'Pay once – 31 days (WeChat / Alipay)',
    close: 'Maybe Later',
    login_first: 'Sign in to subscribe',
    checkout_failed: 'Checkout failed. Please try again.',
  },
  'zh-TW': {
    title: '解鎖完整命理解讀',
    subtitle: '獲取所有章節的完整AI分析洞見。',
    free_title: '免費版',
    free_price: '$0',
    premium_title: '高級版',
    premium_price: '訂閱',
    free_features: [
      '八字命盤（四柱）',
      '五行分布圖',
      '預覽所有AI分析（前3行）',
      '每日3次分析',
    ],
    premium_features: [
      '免費版所有功能',
      '所有章節完整AI分析',
      '完整合婚AI洞見',
      '無限次分析',
      'PDF導出（即將推出）',
      '歷史記錄（即將推出）',
    ],
    subscribe: '立即訂閱',
    subscribe_recurring: '訂閱（信用卡，月付）',
    pay_once_31: '一次付款 – 31 天（微信 / 支付寶）',
    close: '稍後再說',
    login_first: '請先登入再訂閱',
    checkout_failed: '結帳失敗，請稍後再試。',
  },
  'zh-CN': {
    title: '解锁完整命理解读',
    subtitle: '获取所有章节的完整AI分析洞见。',
    free_title: '免费版',
    free_price: '$0',
    premium_title: '高级版',
    premium_price: '订阅',
    free_features: [
      '八字命盘（四柱）',
      '五行分布图',
      '预览所有AI分析（前3行）',
      '每日3次分析',
    ],
    premium_features: [
      '免费版所有功能',
      '所有章节完整AI分析',
      '完整合婚AI洞见',
      '无限次分析',
      'PDF导出（即将推出）',
      '历史记录（即将推出）',
    ],
    subscribe: '立即订阅',
    subscribe_recurring: '订阅（信用卡，月付）',
    pay_once_31: '一次付款 – 31 天（微信 / 支付宝）',
    close: '稍后再说',
    login_first: '请先登录再订阅',
    checkout_failed: '结账失败，请稍后再试。',
  },
  ko: {
    title: '전체 사주 분석 잠금 해제',
    subtitle: '모든 섹션의 완전한 AI 분석을 받으세요.',
    free_title: '무료',
    free_price: '$0',
    premium_title: '프리미엄',
    premium_price: '구독',
    free_features: [
      '사주 명반 (사주)',
      '오행 분포도',
      '모든 AI 분석 미리보기 (3줄)',
      '하루 3회 분석',
    ],
    premium_features: [
      '무료 기능 전체 포함',
      '모든 섹션 전체 AI 분석',
      '전체 궁합 AI 분석',
      '무제한 분석',
      'PDF 내보내기 (출시 예정)',
      '기록 저장 (출시 예정)',
    ],
    subscribe: '지금 구독',
    subscribe_recurring: '구독 (카드, 월 결제)',
    pay_once_31: '일회 결제 – 31일 (위챗 / 알리페이)',
    close: '나중에',
    login_first: '구독하려면 먼저 로그인하세요',
    checkout_failed: '결제에 실패했습니다. 다시 시도해 주세요.',
  },
}

const PricingModal = ({ isOpen, onClose, language = 'en', onNeedAuth }) => {
  const t = labels[language] || labels.en
  const { isAuthenticated, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const runCheckout = async (createSession) => {
    setError(null)
    if (!isAuthenticated) {
      onClose()
      onNeedAuth?.()
      return
    }
    setLoading(true)
    try {
      const { url } = await createSession(token)
      if (url) {
        window.location.href = url
      } else {
        setError(t.checkout_failed || 'Checkout failed. Please try again.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      const message = err?.response?.data?.detail || err?.message || 'Checkout failed. Please try again.'
      setError(typeof message === 'string' ? message : 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribeRecurring = () => runCheckout(createCheckoutSession)
  const handlePayOnce31 = () => runCheckout(createCheckoutSessionOnetime)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl border border-white/10 bg-bazi-surface shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center pt-8 pb-4 px-6">
          <h2 className="text-2xl font-bold text-bazi-gold mb-2">{t.title}</h2>
          <p className="text-sm text-neutral-400">{t.subtitle}</p>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-4 px-6 pb-6">
          {/* Free column */}
          <div className="rounded-xl border border-white/5 bg-neutral-800/30 p-5">
            <h3 className="text-sm font-bold text-neutral-400 mb-1">{t.free_title}</h3>
            <p className="text-2xl font-bold text-neutral-300 mb-4">{t.free_price}</p>
            <ul className="space-y-2">
              {t.free_features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                  <span className="text-neutral-600 mt-0.5">◇</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium column */}
          <div className="rounded-xl border border-bazi-gold/30 bg-bazi-gold/5 p-5 relative">
            <div className="absolute -top-0 right-4 bg-bazi-gold text-bazi-ink text-[9px] font-bold px-2 py-0.5 rounded-b">
              RECOMMENDED
            </div>
            <h3 className="text-sm font-bold text-bazi-gold mb-1">{t.premium_title}</h3>
            <p className="text-2xl font-bold text-bazi-gold mb-4">{t.premium_price}</p>
            <ul className="space-y-2">
              {t.premium_features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-200">
                  <span className="text-bazi-gold mt-0.5">◆</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          {error && (
            <p className="text-sm text-red-400 text-center" role="alert">{error}</p>
          )}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => { onClose(); onNeedAuth?.() }}
              className="w-full py-3 bg-bazi-gold text-bazi-ink font-bold rounded-lg hover:bg-bazi-gold-soft transition-all duration-200"
            >
              {t.login_first}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSubscribeRecurring}
                disabled={loading}
                className="w-full py-3 bg-bazi-gold text-bazi-ink font-bold rounded-lg hover:bg-bazi-gold-soft transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {loading ? '...' : t.subscribe_recurring}
              </button>
              <button
                type="button"
                onClick={handlePayOnce31}
                disabled={loading}
                className="w-full py-2.5 border border-bazi-gold/50 text-bazi-gold font-medium rounded-lg hover:bg-bazi-gold/10 transition-all duration-200 disabled:opacity-50"
              >
                {t.pay_once_31}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-sm text-neutral-500 hover:text-amber-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PricingModal
