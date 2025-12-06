import React from 'react'

const LanguageSelector = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'en', label: '🇺🇸 English', name: 'English' },
    { code: 'zh-CN', label: '🇨🇳 简体中文', name: 'Simplified Chinese' },
    { code: 'zh-TW', label: '🇭🇰 繁體中文', name: 'Traditional Chinese' }
  ]

  return (
    <div className="mb-6 flex flex-wrap gap-2 justify-center">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            language === lang.code
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={lang.name}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector