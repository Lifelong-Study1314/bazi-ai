import React, { useState } from 'react'
import { generateShareImage, downloadImage } from '../utils/shareImage'

/**
 * Action bar with "Save Image" button.
 *
 * - Premium users: fully functional
 * - Free users: shows button with PRO badge, clicking triggers upgrade flow
 */

const LABELS = {
  en: {
    saveImage: 'Save Image',
    generating: 'Generating...',
    saved: 'Saved!',
    failed: 'Failed',
    premiumOnly: 'Premium feature',
  },
  'zh-TW': {
    saveImage: '儲存圖片',
    generating: '生成中...',
    saved: '已儲存！',
    failed: '失敗',
    premiumOnly: '高級版功能',
  },
  'zh-CN': {
    saveImage: '保存图片',
    generating: '生成中...',
    saved: '已保存！',
    failed: '失败',
    premiumOnly: '高级版功能',
  },
  ko: {
    saveImage: '이미지 저장',
    generating: '생성 중...',
    saved: '저장됨!',
    failed: '실패',
    premiumOnly: '프리미엄 기능',
  },
}

export default function ExportShareBar({
  baziChart,
  language = 'en',
  isPremium = false,
  onUpgradeClick,
  shareCardRef,
}) {
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saved' | 'failed'

  const L = LABELS[language] || LABELS.en

  const clearStatus = (setter) => setTimeout(() => setter(null), 2500)

  // ── Save Image handler ──────────────────────────────────────────────
  const handleSaveImage = async () => {
    if (!isPremium) { onUpgradeClick?.(); return }
    if (!shareCardRef?.current) return

    setSaving(true)
    try {
      const blob = await generateShareImage(shareCardRef.current)
      const birthDate = baziChart?.input?.birth_date || 'analysis'
      downloadImage(blob, `BAZI_Report_${birthDate}.png`)
      setSaveStatus('saved')
    } catch (err) {
      console.error('Image generation failed:', err)
      setSaveStatus('failed')
    } finally {
      setSaving(false)
      clearStatus(setSaveStatus)
    }
  }

  const saveLabel = saving ? L.generating
    : saveStatus === 'saved' ? L.saved
    : saveStatus === 'failed' ? L.failed
    : L.saveImage

  const premiumBtn = 'bg-gradient-to-r from-bazi-gold to-amber-500 text-bazi-ink hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
  const freeBtn = 'bg-neutral-800 text-neutral-400 border border-white/10 hover:border-bazi-gold/30 hover:text-bazi-gold'

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4 animate-fade-in">
      {/* Save Image Button */}
      <button
        onClick={handleSaveImage}
        disabled={saving}
        className={`
          group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-200 shadow-card
          ${isPremium ? premiumBtn : freeBtn}
          disabled:opacity-60 disabled:cursor-wait
        `}
      >
        {/* Download icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {saveLabel}
        {!isPremium && (
          <span className="absolute -top-2 -right-2 bg-bazi-gold text-bazi-ink text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow">
            PRO
          </span>
        )}
      </button>

      {/* Premium hint for free users */}
      {!isPremium && (
        <span className="text-xs text-neutral-500 ml-1">{L.premiumOnly}</span>
      )}
    </div>
  )
}
