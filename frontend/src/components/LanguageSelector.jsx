import React from 'react'

export const LanguageSelector = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' }
  ]

  return (
    <div className="flex gap-2 justify-center mb-6">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            flex items-center gap-2
            ${language === lang.code
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
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
