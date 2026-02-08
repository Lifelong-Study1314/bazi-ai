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

const formLabels = {
  en: {
    personA: 'Person A',
    personB: 'Person B',
    date: 'Birth Date',
    time: 'Birth Time',
    gender: 'Gender',
    submit: 'Analyze Compatibility',
    subtitle: 'Enter two birth dates to discover your BAZI compatibility',
  },
  'zh-TW': {
    personA: '甲方',
    personB: '乙方',
    date: '出生日期',
    time: '出生時辰',
    gender: '性別',
    submit: '分析合婚',
    subtitle: '輸入兩人的出生資料，分析八字合婚',
  },
  'zh-CN': {
    personA: '甲方',
    personB: '乙方',
    date: '出生日期',
    time: '出生时辰',
    gender: '性别',
    submit: '分析合婚',
    subtitle: '输入两人的出生资料，分析八字合婚',
  },
  ko: {
    personA: '갑측',
    personB: '을측',
    date: '출생일',
    time: '출생 시',
    gender: '성별',
    submit: '궁합 분석',
    subtitle: '두 사람의 출생 정보를 입력하여 사주 궁합을 확인하세요',
  },
}

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

const PersonBlock = ({ person, data, onChange, errors, language, loading, color }) => {
  const labels = formLabels[language] || formLabels.en
  const genderOptions = genderOptionsByLang[language] || genderOptionsByLang.en
  const birthHours = birthHourData.map(item => ({
    value: item.value,
    label: getBirthHourLabel(item, language),
  }))

  const borderColor = color === 'pink' ? 'border-amber-500/30' : 'border-amber-700/30'
  const bgColor = color === 'pink' ? 'bg-amber-950/20' : 'bg-neutral-900/40'
  const labelColor = color === 'pink' ? 'text-amber-200' : 'text-amber-300/80'

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4 md:p-5 space-y-4`}>
      <h3 className={`text-lg font-semibold ${labelColor} flex items-center gap-2`}>
        <span className="text-bazi-gold">{color === 'pink' ? '◆' : '◇'}</span> {person}
      </h3>

      {/* Birth Date */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 mb-1">{labels.date}</label>
        <input
          type="date"
          value={data.birthDate}
          onChange={(e) => onChange('birthDate', e.target.value)}
          disabled={loading}
          className={inputCls(errors.birthDate)}
        />
        {errors.birthDate && <p className="text-red-300 text-xs mt-1">{errors.birthDate}</p>}
      </div>

      {/* Birth Hour */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 mb-1">{labels.time}</label>
        <select
          value={data.birthHour}
          onChange={(e) => onChange('birthHour', e.target.value)}
          disabled={loading}
          className={inputCls(false)}
        >
          {birthHours.map(h => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 mb-1">{labels.gender}</label>
        <div className="flex gap-3">
          {genderOptions.map(opt => (
            <label
              key={opt.value}
              className={`
                flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                border cursor-pointer text-sm font-medium transition-all duration-200
                ${data.gender === opt.value
                  ? 'border-bazi-gold bg-bazi-surface-soft text-amber-100'
                  : 'border-bazi-gold/40 bg-bazi-surface text-amber-200 hover:border-bazi-gold'
                }
              `}
            >
              <input
                type="radio"
                value={opt.value}
                checked={data.gender === opt.value}
                onChange={() => onChange('gender', opt.value)}
                disabled={loading}
                className="hidden"
              />
              <span className="text-bazi-gold">{opt.symbol}</span> {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export const CompatibilityForm = ({ onSubmit, loading, language }) => {
  const [personA, setPersonA] = useState({ birthDate: '', birthHour: '9', gender: 'male' })
  const [personB, setPersonB] = useState({ birthDate: '', birthHour: '9', gender: 'female' })
  const [errorsA, setErrorsA] = useState({})
  const [errorsB, setErrorsB] = useState({})

  const labels = formLabels[language] || formLabels.en

  const handleChangeA = (field, value) => {
    setPersonA(prev => ({ ...prev, [field]: value }))
    if (errorsA[field]) setErrorsA(prev => ({ ...prev, [field]: '' }))
  }
  const handleChangeB = (field, value) => {
    setPersonB(prev => ({ ...prev, [field]: value }))
    if (errorsB[field]) setErrorsB(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const eA = {}
    const eB = {}
    const dateErr = language === 'en' ? 'Please select birth date' : language === 'zh-TW' ? '請選擇出生日期' : language === 'zh-CN' ? '请选择出生日期' : '출생일을 선택해 주세요'

    if (!personA.birthDate) eA.birthDate = dateErr
    if (!personB.birthDate) eB.birthDate = dateErr
    setErrorsA(eA)
    setErrorsB(eB)
    return Object.keys(eA).length === 0 && Object.keys(eB).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(
        { birth_date: personA.birthDate, birth_hour: parseInt(personA.birthHour), gender: personA.gender },
        { birth_date: personB.birthDate, birth_hour: parseInt(personB.birthHour), gender: personB.gender },
        language
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-center text-neutral-400 text-sm mb-2">{labels.subtitle}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonBlock
          person={labels.personA}
          data={personA}
          onChange={handleChangeA}
          errors={errorsA}
          language={language}
          loading={loading}
          color="pink"
        />
        <PersonBlock
          person={labels.personB}
          data={personB}
          onChange={handleChangeB}
          errors={errorsB}
          language={language}
          loading={loading}
          color="blue"
        />
      </div>

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
        {labels.submit}
      </button>
    </form>
  )
}

export default CompatibilityForm
