/**
 * Localization helpers for BAZI-specific terms.
 *
 * These map backend English-only values (element names, yin/yang,
 * zodiac, seasonal strength, etc.) to the selected UI language.
 *
 * Chinese characters are always acceptable as authenticity markers
 * but all descriptive text should be in the user's chosen language.
 */

const ELEMENT_NAMES = {
  Wood:  { en: 'Wood',  'zh-TW': '木', 'zh-CN': '木', ko: '목(木)' },
  Fire:  { en: 'Fire',  'zh-TW': '火', 'zh-CN': '火', ko: '화(火)' },
  Earth: { en: 'Earth', 'zh-TW': '土', 'zh-CN': '土', ko: '토(土)' },
  Metal: { en: 'Metal', 'zh-TW': '金', 'zh-CN': '金', ko: '금(金)' },
  Water: { en: 'Water', 'zh-TW': '水', 'zh-CN': '水', ko: '수(水)' },
}

const YIN_YANG = {
  Yin:  { en: 'Yin',  'zh-TW': '陰', 'zh-CN': '阴', ko: '음(陰)' },
  Yang: { en: 'Yang', 'zh-TW': '陽', 'zh-CN': '阳', ko: '양(陽)' },
}

const ZODIAC_NAMES = {
  Rat:     { en: 'Rat',     'zh-TW': '鼠', 'zh-CN': '鼠', ko: '쥐(鼠)' },
  Ox:      { en: 'Ox',      'zh-TW': '牛', 'zh-CN': '牛', ko: '소(牛)' },
  Tiger:   { en: 'Tiger',   'zh-TW': '虎', 'zh-CN': '虎', ko: '호랑이(虎)' },
  Rabbit:  { en: 'Rabbit',  'zh-TW': '兔', 'zh-CN': '兔', ko: '토끼(兔)' },
  Dragon:  { en: 'Dragon',  'zh-TW': '龍', 'zh-CN': '龙', ko: '용(龍)' },
  Snake:   { en: 'Snake',   'zh-TW': '蛇', 'zh-CN': '蛇', ko: '뱀(蛇)' },
  Horse:   { en: 'Horse',   'zh-TW': '馬', 'zh-CN': '马', ko: '말(馬)' },
  Goat:    { en: 'Goat',    'zh-TW': '羊', 'zh-CN': '羊', ko: '양(羊)' },
  Monkey:  { en: 'Monkey',  'zh-TW': '猴', 'zh-CN': '猴', ko: '원숭이(猴)' },
  Rooster: { en: 'Rooster', 'zh-TW': '雞', 'zh-CN': '鸡', ko: '닭(雞)' },
  Dog:     { en: 'Dog',     'zh-TW': '狗', 'zh-CN': '狗', ko: '개(狗)' },
  Pig:     { en: 'Pig',     'zh-TW': '豬', 'zh-CN': '猪', ko: '돼지(豬)' },
}

const SEASONAL_STRENGTH = {
  prosperous:  { en: 'Prosperous',  'zh-TW': '旺',  'zh-CN': '旺',  ko: '왕(旺)' },
  strong:      { en: 'Strong',      'zh-TW': '相',  'zh-CN': '相',  ko: '상(相)' },
  moderate:    { en: 'Moderate',    'zh-TW': '休',  'zh-CN': '休',  ko: '휴(休)' },
  weak:        { en: 'Weak',        'zh-TW': '囚',  'zh-CN': '囚',  ko: '수(囚)' },
  dead:        { en: 'Dead',        'zh-TW': '死',  'zh-CN': '死',  ko: '사(死)' },
  neutral:     { en: 'Neutral',     'zh-TW': '中和', 'zh-CN': '中和', ko: '중화(中和)' },
}

export function localizeElement(element, language) {
  return ELEMENT_NAMES[element]?.[language] || ELEMENT_NAMES[element]?.en || element || ''
}

export function localizeYinYang(yy, language) {
  return YIN_YANG[yy]?.[language] || YIN_YANG[yy]?.en || yy || ''
}

export function localizeZodiac(zodiac, language) {
  return ZODIAC_NAMES[zodiac]?.[language] || ZODIAC_NAMES[zodiac]?.en || zodiac || ''
}

export function localizeStrength(strength, language) {
  return SEASONAL_STRENGTH[strength]?.[language] || SEASONAL_STRENGTH[strength]?.en || strength || ''
}

const INTERACTION_TYPES = {
  Clash:       { en: 'Clash',       'zh-TW': '沖', 'zh-CN': '冲', ko: '충(沖)' },
  Combination: { en: 'Combination', 'zh-TW': '合', 'zh-CN': '合', ko: '합(合)' },
}

export function localizeInteractionType(type, language) {
  return INTERACTION_TYPES[type]?.[language] || INTERACTION_TYPES[type]?.en || type || ''
}

/**
 * For Ten God / Deity names: show the primary-language name first,
 * with the other language in parentheses for authenticity.
 *
 * English: "Indirect Wealth (偏財)"
 * zh-TW:   "偏財"
 * zh-CN:   "偏财"
 * Korean:  "편재(偏財)"   ← Korean reading + Hanja
 */
// ==================== FORECAST LOCALIZATION ====================

const DOMAIN_LABELS = {
  love:   { en: 'Love',   'zh-TW': '愛情', 'zh-CN': '爱情', ko: '애정' },
  wealth: { en: 'Wealth', 'zh-TW': '財運', 'zh-CN': '财运', ko: '재운' },
  career: { en: 'Career', 'zh-TW': '事業', 'zh-CN': '事业', ko: '사업' },
  study:  { en: 'Study',  'zh-TW': '學業', 'zh-CN': '学业', ko: '학업' },
  social: { en: 'Social', 'zh-TW': '人際', 'zh-CN': '人际', ko: '인간관계' },
}

const FORECAST_UI = {
  todayFortune: { en: "Today's Fortune", 'zh-TW': '今日運勢', 'zh-CN': '今日运势', ko: '오늘의 운세' },
  weeklyTrend:  { en: 'Weekly Trend',    'zh-TW': '本週趨勢', 'zh-CN': '本周趋势', ko: '주간 추세' },
  domainScores: { en: 'Domain Scores',   'zh-TW': '運勢分析', 'zh-CN': '运势分析', ko: '운세 분석' },
  dosAndDonts:  { en: "Do's & Don'ts",   'zh-TW': '宜 & 忌',  'zh-CN': '宜 & 忌',  ko: '하세요 & 하지 마세요' },
  luckyItems:   { en: 'Lucky Items',     'zh-TW': '幸運指南', 'zh-CN': '幸运指南', ko: '행운 아이템' },
  energyRhythm: { en: 'Energy Rhythm',   'zh-TW': '時辰能量', 'zh-CN': '时辰能量', ko: '시진 에너지' },
  dailyWisdom:  { en: 'Daily Wisdom',    'zh-TW': '每日箴言', 'zh-CN': '每日箴言', ko: '오늘의 지혜' },
  do:           { en: 'Do',              'zh-TW': '宜',      'zh-CN': '宜',      ko: '하세요' },
  dont:         { en: "Don't",           'zh-TW': '忌',      'zh-CN': '忌',      ko: '하지 마세요' },
  color:        { en: 'Color',           'zh-TW': '顏色',    'zh-CN': '颜色',    ko: '색상' },
  number:       { en: 'Number',          'zh-TW': '數字',    'zh-CN': '数字',    ko: '숫자' },
  direction:    { en: 'Direction',       'zh-TW': '方位',    'zh-CN': '方位',    ko: '방향' },
  hour:         { en: 'Lucky Hour',      'zh-TW': '吉時',    'zh-CN': '吉时',    ko: '길한 시간' },
  object:       { en: 'Object',          'zh-TW': '物品',    'zh-CN': '物品',    ko: '물건' },
  food:         { en: 'Food',            'zh-TW': '食物',    'zh-CN': '食物',    ko: '음식' },
  today:        { en: 'Today',           'zh-TW': '今天',    'zh-CN': '今天',    ko: '오늘' },
  premium:      { en: 'Premium Feature', 'zh-TW': '高級功能', 'zh-CN': '高级功能', ko: '프리미엄 기능' },
  unlockFull:   { en: 'Unlock full forecast', 'zh-TW': '解鎖完整預測', 'zh-CN': '解锁完整预测', ko: '전체 예측 잠금 해제' },
  enterBirth:   { en: 'Enter your birth details to see your daily forecast', 'zh-TW': '輸入出生資料以查看每日運勢', 'zh-CN': '输入出生资料以查看每日运势', ko: '생년월일을 입력하여 오늘의 운세를 확인하세요' },
  analyzingForecast: { en: 'Analyzing your daily fortune...', 'zh-TW': '分析每日運勢中...', 'zh-CN': '分析每日运势中...', ko: '오늘의 운세 분석 중...' },
}

export function localizeDomain(domain, language) {
  return DOMAIN_LABELS[domain]?.[language] || DOMAIN_LABELS[domain]?.en || domain || ''
}

export function localizeForecastUI(key, language) {
  return FORECAST_UI[key]?.[language] || FORECAST_UI[key]?.en || key || ''
}

export function localizeNamePair(nameEn, nameCn, language) {
  if (language === 'zh-TW' || language === 'zh-CN') {
    return nameCn || nameEn || ''
  }
  if (language === 'ko') {
    // Korean: show Chinese in parentheses for reference
    return nameCn ? `${nameCn}` : nameEn || ''
  }
  // English: show English first, Chinese in parentheses
  if (nameEn && nameCn) return `${nameEn} (${nameCn})`
  return nameEn || nameCn || ''
}
