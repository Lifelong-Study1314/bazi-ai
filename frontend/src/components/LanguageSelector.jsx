import React from 'react'


export const LanguageSelector = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' }
  ]


  return (
    <div className="flex gap-2 justify-center mb-6 flex-wrap">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            flex items-center gap-2
          `}
          style={{
            backgroundColor: language === lang.code 
              ? '#c9a969' 
              : '#1e2438',
            color: language === lang.code 
              ? '#0d1117' 
              : '#a0a8c4',
            border: language === lang.code 
              ? '2px solid #ffd700'
              : '2px solid #2a3142',
            boxShadow: language === lang.code 
              ? '0 4px 12px rgba(201, 169, 105, 0.3)' 
              : 'none',
            transform: language === lang.code 
              ? 'scale(1.05)' 
              : 'scale(1)',
          }}
        >
          <span>{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}


export default LanguageSelector
