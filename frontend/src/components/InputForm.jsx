import React, { useState } from 'react'

const birthHours = [
  { value: 23, label: '子時 (11pm-1am)' },
  { value: 1, label: '丑時 (1am-3am)' },
  { value: 3, label: '寅時 (3am-5am)' },
  { value: 5, label: '卯時 (5am-7am)' },
  { value: 7, label: '辰時 (7am-9am)' },
  { value: 9, label: '巳時 (9am-11am)' },
  { value: 11, label: '午時 (11am-1pm)' },
  { value: 13, label: '未時 (1pm-3pm)' },
  { value: 15, label: '申時 (3pm-5pm)' },
  { value: 17, label: '酉時 (5pm-7pm)' },
  { value: 19, label: '戌時 (7pm-9pm)' },
  { value: 21, label: '亥時 (9pm-11pm)' }
]

const genderOptions = [
  { value: 'male', label: '男 / Male', emoji: '♂️' },
  { value: 'female', label: '女 / Female', emoji: '♀️' }
]

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
      newErrors.birthDate = language === 'en' ? 'Please select your birth date' : language === 'zh-TW' ? '請選擇出生日期' : '请选择出生日期'
    }
    
    if (!formData.birthHour && formData.birthHour !== '0') {
      newErrors.birthHour = language === 'en' ? 'Please select your birth hour' : language === 'zh-TW' ? '請選擇出生時辰' : '请选择出生时辰'
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
    'zh-CN': { date: '出生日期', time: '出生时辰', gender: '性别', submit: '计算八字' }
  }

  const labels = labelText[language] || labelText.en

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Birth Date */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          {labels.date}
        </label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          disabled={loading}
          className={`
            w-full px-4 py-3 rounded-lg border-2
            text-gray-800 font-medium
            transition-all duration-200
            ${errors.birthDate
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white focus:border-purple-500 focus:outline-none'
            }
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />
        {errors.birthDate && <p className="text-red-300 text-sm mt-1">{errors.birthDate}</p>}
      </div>

      {/* Birth Hour */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          {labels.time}
        </label>
        <select
          name="birthHour"
          value={formData.birthHour}
          onChange={handleChange}
          disabled={loading}
          className={`
            w-full px-4 py-3 rounded-lg border-2
            text-gray-800 font-medium
            transition-all duration-200
            ${errors.birthHour
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white focus:border-purple-500 focus:outline-none'
            }
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        >
          {birthHours.map(hour => (
            <option key={hour.value} value={hour.value}>
              {hour.label}
            </option>
          ))}
        </select>
        {errors.birthHour && <p className="text-red-300 text-sm mt-1">{errors.birthHour}</p>}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-bold text-white mb-2">
          {labels.gender}
        </label>
        <div className="flex gap-4">
          {genderOptions.map(option => (
            <label
              key={option.value}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                border-2 cursor-pointer font-medium transition-all duration-200
                ${formData.gender === option.value
                  ? 'border-purple-600 bg-purple-100 text-purple-900'
                  : 'border-gray-300 bg-white text-gray-800 hover:border-purple-400'
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
            ? 'bg-gray-400 cursor-not-allowed opacity-75'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105 active:scale-95'
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
