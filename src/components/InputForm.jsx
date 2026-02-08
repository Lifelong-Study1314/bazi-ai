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
    { value: 'male', label: 'Male', symbol: '♂' },
    { value: 'female', label: 'Female', symbol: '♀' },
  ],
  'zh-TW': [
    { value: 'male', label: '男', symbol: '♂' },
    { value: 'female', label: '女', symbol: '♀' },
  ],
  'zh-CN': [
    { value: 'male', label: '男', symbol: '♂' },
    { value: 'female', label: '女', symbol: '♀' },
  ],
  ko: [
    { value: 'male', label: '남', symbol: '♂' },
    { value: 'female', label: '여', symbol: '♀' },
  ],
}

const calendarLabels = {
  en: { solar: 'Solar Calendar', lunar: 'Lunar Calendar', year: 'Year', month: 'Month', day: 'Day', leapMonth: 'Leap Month' },
  'zh-TW': { solar: '國曆', lunar: '農曆', year: '年', month: '月', day: '日', leapMonth: '閏月' },
  'zh-CN': { solar: '公历', lunar: '农历', year: '年', month: '月', day: '日', leapMonth: '闰月' },
  ko: { solar: '양력', lunar: '음력', year: '년', month: '월', day: '일', leapMonth: '윤달' },
}

const lunarMonthNames = {
  en: ['Jan (1)', 'Feb (2)', 'Mar (3)', 'Apr (4)', 'May (5)', 'Jun (6)', 'Jul (7)', 'Aug (8)', 'Sep (9)', 'Oct (10)', 'Nov (11)', 'Dec (12)'],
  'zh-TW': ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  'zh-CN': ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
}

const YEAR_MIN = 1920
const YEAR_MAX = 2050

export const InputForm = ({ onSubmit, loading, language, submitLabel }) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthHour: '9',
    gender: 'male',
  })
  const [calendarType, setCalendarType] = useState('solar')
  const [lunarYear, setLunarYear] = useState('')
  const [lunarMonth, setLunarMonth] = useState('1')
  const [lunarDay, setLunarDay] = useState('1')
  const [isLeapMonth, setIsLeapMonth] = useState(false)

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const futureDateMsg = {
      en: 'Birth date cannot be in the future',
      'zh-TW': '出生日期不能是未來日期',
      'zh-CN': '出生日期不能是未来日期',
      ko: '출생일은 미래 날짜일 수 없습니다',
    }
    const dateRangeMsg = {
      en: 'Birth year must be between 1920 and 2050',
      'zh-TW': '出生年份必須在 1920 至 2050 之間',
      'zh-CN': '出生年份必须在 1920 至 2050 之间',
      ko: '출생 연도는 1920에서 2050 사이여야 합니다',
    }

    if (calendarType === 'solar') {
      if (!formData.birthDate) {
        newErrors.birthDate = language === 'en' ? 'Please select your birth date' : language === 'zh-TW' ? '請選擇出生日期' : language === 'zh-CN' ? '请选择出生日期' : '출생일을 선택해 주세요'
      } else {
        // Future date check
        const selected = new Date(formData.birthDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (selected > today) {
          newErrors.birthDate = futureDateMsg[language] || futureDateMsg.en
        }
        // Year range check
        const year = selected.getFullYear()
        if (year < YEAR_MIN || year > YEAR_MAX) {
          newErrors.birthDate = dateRangeMsg[language] || dateRangeMsg.en
        }
      }
    } else {
      if (!lunarYear) {
        newErrors.lunarYear = language === 'en' ? 'Please select year' : language === 'zh-TW' ? '請選擇年份' : language === 'zh-CN' ? '请选择年份' : '연도를 선택해 주세요'
      } else {
        const ly = parseInt(lunarYear)
        if (ly > new Date().getFullYear()) {
          newErrors.lunarYear = futureDateMsg[language] || futureDateMsg.en
        }
      }
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

      if (calendarType === 'lunar') {
        const y = parseInt(lunarYear)
        const m = parseInt(lunarMonth)
        const d = parseInt(lunarDay)
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        onSubmit(dateStr, hour, formData.gender, language, 'lunar', isLeapMonth)
      } else {
        onSubmit(formData.birthDate, hour, formData.gender, language, 'solar', false)
      }
    }
  }

  const labelText = {
    en: { date: 'Birth Date', time: 'Birth Time', gender: 'Gender', submit: 'Analyze My BAZI' },
    'zh-TW': { date: '出生日期', time: '出生時辰', gender: '性別', submit: '計算八字' },
    'zh-CN': { date: '出生日期', time: '出生时辰', gender: '性别', submit: '计算八字' },
    ko: { date: '출생일', time: '출생 시', gender: '성별', submit: '사주 분석하기' }
  }

  const labels = labelText[language] || labelText.en
  const calLabels = calendarLabels[language] || calendarLabels.en
  const monthNames = lunarMonthNames[language] || lunarMonthNames.en
  const birthHours = birthHourData.map((item) => ({
    value: item.value,
    label: getBirthHourLabel(item, language),
  }))
  const genderOptions = genderOptionsByLang[language] || genderOptionsByLang.en

  const inputCls = (hasError) => `
    w-full px-4 py-3 rounded-lg border
    text-amber-50 font-medium
    transition-all duration-200
    ${hasError
      ? 'border-red-500 bg-red-950'
      : 'border-bazi-gold/40 bg-bazi-surface-soft focus:border-bazi-gold focus:outline-none'
    }
    disabled:bg-neutral-800 disabled:text-neutral-400 disabled:cursor-not-allowed
  `

  // Build year options
  const yearOptions = []
  for (let y = YEAR_MAX; y >= YEAR_MIN; y--) {
    yearOptions.push(y)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Calendar Type Toggle */}
      <div>
        <label className="block text-sm font-semibold text-neutral-500 mb-2">
          {language === 'en' ? 'Calendar Type' : language === 'zh-TW' ? '日曆類型' : language === 'zh-CN' ? '日历类型' : '달력 유형'}
        </label>
        <div className="flex gap-4">
          {['solar', 'lunar'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => { setCalendarType(type); setErrors({}) }}
              disabled={loading}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                border cursor-pointer font-medium transition-all duration-200
                ${calendarType === type
                  ? 'border-bazi-gold bg-bazi-surface-soft text-amber-100'
                  : 'border-bazi-gold/40 bg-bazi-surface text-amber-200 hover:border-bazi-gold'
                }
                disabled:cursor-not-allowed
              `}
            >
              <span className="text-bazi-gold">{type === 'solar' ? '☉' : '☽'}</span>
              {type === 'solar' ? calLabels.solar : calLabels.lunar}
            </button>
          ))}
        </div>
      </div>

      {/* Birth Date — Solar or Lunar */}
      <div>
        <label className="block text-sm font-semibold text-neutral-500 mb-2">
          {labels.date}
        </label>

        {calendarType === 'solar' ? (
          <>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              disabled={loading}
              min={`${YEAR_MIN}-01-01`}
              max={new Date().toISOString().split('T')[0]}
              aria-label={labels.date}
              aria-invalid={!!errors.birthDate}
              aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
              className={inputCls(errors.birthDate)}
            />
            {errors.birthDate && <p id="birthDate-error" className="text-red-300 text-sm mt-1" role="alert">{errors.birthDate}</p>}
          </>
        ) : (
          <div className="space-y-3">
            {/* Year dropdown */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <select
                  value={lunarYear}
                  onChange={(e) => { setLunarYear(e.target.value); if (errors.lunarYear) setErrors(prev => ({ ...prev, lunarYear: '' })) }}
                  disabled={loading}
                  aria-label={calLabels.year}
                  className={inputCls(errors.lunarYear)}
                >
                  <option value="">{calLabels.year}</option>
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {errors.lunarYear && <p className="text-red-300 text-xs mt-1" role="alert">{errors.lunarYear}</p>}
              </div>

              {/* Month dropdown */}
              <div>
                <select
                  value={lunarMonth}
                  onChange={(e) => setLunarMonth(e.target.value)}
                  disabled={loading}
                  aria-label={calLabels.month}
                  className={inputCls(false)}
                >
                  {monthNames.map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Day dropdown */}
              <div>
                <select
                  value={lunarDay}
                  onChange={(e) => setLunarDay(e.target.value)}
                  disabled={loading}
                  aria-label={calLabels.day}
                  className={inputCls(false)}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leap month checkbox */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-amber-200">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-bazi-gold/40 bg-bazi-surface accent-bazi-gold"
              />
              {calLabels.leapMonth}
              <span className="text-neutral-500 text-xs">
                {language === 'en' ? '(rare — check if your lunar month is a leap month)' : language === 'zh-TW' ? '（少見——請確認該農曆月份是否為閏月）' : language === 'zh-CN' ? '（少见——请确认该农历月份是否为闰月）' : '(드문 경우 — 윤달인지 확인하세요)'}
              </span>
            </label>
          </div>
        )}
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
          className={inputCls(errors.birthHour)}
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
              <span className="text-bazi-gold">{option.symbol}</span>
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
        {loading ? '◌ ' : '◈ '}
        {submitLabel || labels.submit}
      </button>
    </form>
  )
}

export default InputForm
