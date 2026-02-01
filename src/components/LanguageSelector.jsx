import React from 'react'

export const LanguageSelector = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
    { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' }
  ]

  return (
    <div className="flex gap-2 justify-center mb-6" role="group" aria-label="Select language">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          aria-pressed={language === lang.code}
          aria-label={`${lang.label}${language === lang.code ? ' (selected)' : ''}`}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            flex items-center gap-2
            ${language === lang.code
              ? 'bg-bazi-gold text-bazi-ink font-semibold border border-bazi-gold shadow-card'
              : 'bg-bazi-surface-soft/80 border border-white/5 text-neutral-400 hover:border-amber-500/30 hover:text-amber-100'
            }
          `}
        >
          <span>{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector
