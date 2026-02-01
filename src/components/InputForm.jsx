import React, { useState } from 'react'

const birthHourData = [
  { value: 23, zodiac: '子', enTime: '11pm-1am', time24: '23:00-01:00' },
  { value: 1, zodiac: '丑', enTime: '1am-3am', time24: '01:00-03:00' },
  { value: 3, zodiac: '寅', enTime: '3am-5am', time24: '03:00-05:00' },
  { value: 5, zodiac: '卯', enTime: '5am-7am', time24: '05:00-07:00' },
  { value: 7, zodiac: '辰', enTime: '7am-9am', time24: '07:00-09:00' },
  { value: 9, zodiac: '巳', enTime: '9am-11am', time24: '09:00-11:00' },
  { value: 11, zodiac: '午', enTime: '11am-1pm', time24: '11:00-13:00' },
  { value: 13, zodiac: '未', enTime: '1pm-3pm', time24: '13:00-15:00' },
  { value: 15, zodiac: '申', enTime: '3pm-5pm', time24: '15:00-17:00' },
  { value: 17, zodiac: '酉', enTime: '5pm-7pm', time24: '17:00-19:00' },
  { value: 19, zodiac: '戌', enTime: '7pm-9pm', time24: '19:00-21:00' },
  { value: 21, zodiac: '亥', enTime: '9pm-11pm', time24: '21:00-23:00' },
]

const getBirthHourLabel = (item, language) => {
  if (language === 'en') return `${item.enTime} (${item.zodiac})`
  if (language === 'zh-TW') return `${item.zodiac}時 (${item.time24})`
  if (language === 'zh-CN') return `${item.zodiac}时 (${item.time24})`
  if (language === 'ko') return `${item.zodiac}시 (${item.time24})`
  return `${item.zodiac}时 (${item.time24})`
}

const genderOptionsByLang = {
  en: [
    { value: 'male', label: 'Male', emoji: '♂️' },
    { value: 'female', label: 'Female', emoji: '♀️' },
  ],
  'zh-TW': [
    { value: 'male', label: '男', emoji: '♂️' },
    { value: 'female', label: '女', emoji: '♀️' },
  ],
  'zh-CN': [
    { value: 'male', label: '男', emoji: '♂️' },
    { value: 'female', label: '女', emoji: '♀️' },
  ],
  ko: [
    { value: 'male', label: '남', emoji: '♂️' },
    { value: 'female', label: '여', emoji: '♀️' },
  ],
}

export const InputForm = ({ onSubmit, loading, language }) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthHour: '9',
    gender: 'male'
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.birthDate) {
      newErrors.birthDate = language === 'en' ? 'Please select your birth date' : language === 'zh-TW' ? '請選擇出生日期' : language === 'zh-CN' ? '请选择出生日期' : '출생일을 선택해 주세요'
    }
    
    if (!formData.birthHour && formData.birthHour !== '0') {
      newErrors.birthHour = language === 'en' ? 'Please select your birth hour' : language === 'zh-TW' ? '請選擇出生時辰' : language === 'zh-CN' ? '请选择出生时辰' : '출생 시를 선택해 주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const hour = parseInt(formData.birthHour)
      onSubmit(formData.birthDate, hour, formData.gender, language)
    }
  }

  const labelText = {
    en: { date: 'Birth Date', time: 'Birth Time', gender: 'Gender', submit: 'Analyze My BAZI' },
    'zh-TW': { date: '出生日期', time: '出生時辰', gender: '性別', submit: '計算八字' },
    'zh-CN': { date: '出生日期', time: '出生时辰', gender: '性别', submit: '计算八字' },
    ko: { date: '출생일', time: '출생 시', gender: '성별', submit: '사주 분석하기' }
  }

  const labels = labelText[language] || labelText.en
  const birthHours = birthHourData.map((item) => ({
    value: item.value,
    label: getBirthHourLabel(item, language),
  }))
  const genderOptions = genderOptionsByLang[language] || genderOptionsByLang.en

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Birth Date */}
      <div>
        <label className="block text-sm font-semibold text-neutral-500 mb-2">
          {labels.date}
        </label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          disabled={loading}
          aria-label={labels.date}
          aria-invalid={!!errors.birthDate}
          aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
          className={`
            w-full px-4 py-3 rounded-lg border
            text-amber-50 font-medium
            transition-all duration-200
            ${errors.birthDate
              ? 'border-red-500 bg-red-950'
              : 'border-bazi-gold/40 bg-bazi-surface-soft focus:border-bazi-gold focus:outline-none'
            }
            disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed
          `}
        />
        {errors.birthDate && <p id="birthDate-error" className="text-red-300 text-sm mt-1" role="alert">{errors.birthDate}</p>}
      </div>

      {/* Birth Hour */}
      <div>
        <label className="block text-sm font-semibold text-neutral-500 mb-2">
          {labels.time}
        </label>
        <select
          name="birthHour"
          value={formData.birthHour}
          onChange={handleChange}
          disabled={loading}
          aria-label={labels.time}
          aria-invalid={!!errors.birthHour}
          aria-describedby={errors.birthHour ? 'birthHour-error' : undefined}
          className={`
            w-full px-4 py-3 rounded-lg border
            text-amber-50 font-medium
            transition-all duration-200
            ${errors.birthHour
              ? 'border-red-500 bg-red-950'
              : 'border-bazi-gold/40 bg-bazi-surface-soft focus:border-bazi-gold focus:outline-none'
            }
            disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed
          `}
        >
          {birthHours.map(hour => (
            <option key={hour.value} value={hour.value}>
              {hour.label}
            </option>
          ))}
        </select>
        {errors.birthHour && <p id="birthHour-error" className="text-red-300 text-sm mt-1" role="alert">{errors.birthHour}</p>}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-semibold text-neutral-500 mb-2">
          {labels.gender}
        </label>
        <div className="flex gap-4">
          {genderOptions.map(option => (
            <label
              key={option.value}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                border cursor-pointer font-medium transition-all duration-200
                ${formData.gender === option.value
                  ? 'border-bazi-gold bg-bazi-surface-soft text-amber-100'
                  : 'border-bazi-gold/40 bg-bazi-surface text-amber-200 hover:border-bazi-gold'
                }
                disabled:cursor-not-allowed
              `}
            >
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={formData.gender === option.value}
                onChange={handleChange}
                disabled={loading}
                className="hidden"
              />
              <span>{option.emoji}</span>
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-4 px-6 rounded-lg font-bold text-lg
          transition-all duration-200 transform
          ${loading
            ? 'bg-neutral-600 cursor-not-allowed opacity-75 text-neutral-200'
            : 'bg-bazi-gold text-bazi-ink hover:bg-bazi-gold-soft hover:shadow-xl hover:scale-105 active:scale-95'
          }
        `}
      >
        {loading ? '⏳ ' : '✨ '}
        {labels.submit}
      </button>
    </form>
  )
}

export default InputForm
