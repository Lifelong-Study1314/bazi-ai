import React, { useState, useEffect, useRef, useCallback } from 'react';
import { stripDisclaimers } from '../utils/stripDisclaimers';
import './EnhancedInsightDisplay.css';

const BOOKMARKS_KEY = 'bazi-bookmarks';

const getBookmarks = () => {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const saveBookmarks = (ids) => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
};

const LABELS = {
  header: { en: 'BAZI Destiny Analysis', 'zh-TW': '八字命運分析', 'zh-CN': '八字命运分析', ko: '사주 운명 분석' },
  subtitle: { en: 'Structured interpretation of your life chart', 'zh-TW': '您的人生命盤結構化解讀', 'zh-CN': '您的人生命盘结构化解读', ko: '인생 차트의 구조화된 해석' },
  empty: { en: 'Insights will appear here...', 'zh-TW': '分析結果將在此顯示...', 'zh-CN': '分析结果将在此显示...', ko: '분석 결과가 여기에 표시됩니다...' },
  overview: { en: 'Overview', 'zh-TW': '總覽', 'zh-CN': '总览', ko: '개요' },
  analysis: { en: 'Analysis', 'zh-TW': '分析', 'zh-CN': '分析', ko: '분석' },
  copied: { en: 'Copied!', 'zh-TW': '已複製！', 'zh-CN': '已复制！', ko: '복사됨!' },
};

export const EnhancedInsightDisplay = ({ insights, language = 'en' }) => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [bookmarks, setBookmarksState] = useState(getBookmarks);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    let text = typeof insights === 'string' ? insights : '';
    if (!text || typeof text !== 'string') {
      setSections([]);
      return;
    }

    // Strip common AI disclaimer phrases (anywhere in text, not just at end)
    text = stripDisclaimers(text)

    try {
      const parsedSections = [];
      
      // First, extract the intro (everything before first ###)
      const introMatch = text.match(/^([\s\S]*?)(###\s+\d+\.)/);
      const intro = introMatch ? introMatch[1] : '';
      
      if (intro && intro.trim().length > 0) {
        parsedSections.push({
          type: 'intro',
          content: intro.trim(),
          title: 'Overview'
        });
      }

      // Now split by ### markers
      const parts = text.split(/###\s+/);
      
      // Skip first part (it's the intro we already processed)
      for (let i = 1; i < parts.length; i++) {
        const section = parts[i];
        if (!section || !section.trim || section.trim().length === 0) continue;
        const lines = section.split('\n');
        if (!lines || lines.length === 0) continue;  // ← Safe checks

        // First line should have number and title like "1. Chart Structure & Strength Analysis"
        const firstLine = lines[0] ? lines[0].trim() : '';
        
        // Extract just the title part (remove the number)
        const titleMatch = firstLine.match(/^\d+\.\s+(.+)$/);
        const title = titleMatch ? titleMatch[1] : firstLine;
        
        // Rest is content
        const content = lines.slice(1).join('\n').trim();

        if (title && content) {
          parsedSections.push({
            type: 'section',
            title: title,
            content: content
          });
        }
      }

      setSections(parsedSections);
    } catch (error) {
      console.error('Error parsing insights:', error);
      setSections([
        {
          type: 'raw',
          content: text,
          title: 'Analysis'
        }
      ]);
    }
  }, [insights]);

  // IntersectionObserver for scroll highlighting
  useEffect(() => {
    if (sections.length === 0) return;
    const observers = [];
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
    sections.forEach((_, index) => {
      const el = document.getElementById(`section-${index}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(index);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const handleCopy = useCallback(async (index) => {
    const section = sections[index];
    if (!section?.content) return;
    try {
      await navigator.clipboard.writeText(`${section.title}\n\n${section.content}`);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }, [sections]);

  const toggleBookmark = useCallback((index) => {
    const id = `section-${index}`;
    const next = bookmarks.includes(id) ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    setBookmarksState(next);
    saveBookmarks(next);
  }, [bookmarks]);

  const getSectionIcon = (title) => {
    const iconMap = {
      'Chart Structure': '◎',
      'Career & Finance': '◈',
      'Relationships': '◇',
      'Health': '✦',
      'Personality': '◆',
      'Luck Cycles': '↻',
      'Life Guidance': '▸',
      'Yearly Forecast': '⟡',
      '流年展望': '⟡',
      '命盘结构与强弱分析': '◎',
      '命盤結構與強弱分析': '◎',
      '职业与财富': '◈',
      '職業與財富': '◈',
      '关系与婚姻': '◇',
      '關係與婚姻': '◇',
      '健康与养生': '✦',
      '健康與養生': '✦',
      '性格与品质': '◆',
      '性格與品質': '◆',
      '幸运周期与时机': '↻',
      '幸運周期與時機': '↻',
      '人生指引与个人发展': '▸',
      '人生指引與個人發展': '▸',
      '사주 구조와 강약 분석': '◎',
      '직업과 재물': '◈',
      '관계와 결혼': '◇',
      '건강과 양생': '✦',
      '성격과 품성': '◆',
      '대운 주기와 시기': '↻',
      '인생 가이드와 자기계발': '▸',
      '연간 전망': '⟡',
    };
    for (const [key, icon] of Object.entries(iconMap)) {
      if (title.includes(key)) return icon;
    }
    return '◉';
  };

  const getSectionColor = (index) => {
    const colors = [
      'section-blue',
      'section-green',
      'section-purple',
      'section-orange',
      'section-pink',
      'section-teal',
      'section-amber'
    ];
    return colors[index % colors.length];
  };

  const getLabel = (key) => LABELS[key]?.[language] || LABELS[key]?.en || key;

  if (sections.length === 0) {
    const isStreaming = insights && typeof insights === 'string' && insights.length > 0;
    return (
      <div className="enhanced-insights-container">
        {isStreaming ? (
          <div className="sections-wrapper space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="insight-section animate-pulse bg-neutral-800/50 rounded-xl h-24 border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="insights-empty">
            <p>{getLabel('empty')}</p>
          </div>
        )}
      </div>
    );
  }

  const scrollToSection = (index) => {
    const el = document.getElementById(`section-${index}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="enhanced-insights-container" ref={containerRef}>
      <div className="insights-header">
        <h2>{getLabel('header')}</h2>
        <p className="insights-subtitle">{getLabel('subtitle')}</p>
      </div>

      {/* Section navigation */}
      {sections.length > 1 && (
        <nav className="insights-nav mb-4 overflow-x-auto pb-2" aria-label="Section navigation">
          <div className="flex flex-wrap gap-2 items-center">
            {bookmarks.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBookmarksOnly((v) => !v)}
                className={`px-2 py-1 rounded text-xs font-medium ${showBookmarksOnly ? 'bg-bazi-gold/30 text-amber-200' : 'bg-white/5 text-neutral-400 hover:text-amber-200'}`}
              >
                ★ {bookmarks.length}
              </button>
            )}
            <div className="flex gap-2 min-w-max overflow-x-auto">
              {sections
                .map((section, index) => ({ section, index }))
                .filter(({ index }) => !showBookmarksOnly || bookmarks.includes(`section-${index}`))
                .map(({ section, index }) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => scrollToSection(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                      activeSection === index
                        ? 'bg-bazi-gold/30 text-amber-200 border-bazi-gold/50'
                        : 'bg-bazi-surface/80 border-white/5 text-amber-100 hover:border-amber-500/30 hover:bg-bazi-surface'
                    }`}
                  >
                    {getSectionIcon(section.title)} {section.type === 'intro' ? getLabel('overview') : section.type === 'raw' ? getLabel('analysis') : section.title}
                  </button>
                ))}
            </div>
          </div>
        </nav>
      )}

      <div className="sections-wrapper">
        {sections
          .map((section, index) => ({ section, index }))
          .filter(({ index }) => !showBookmarksOnly || bookmarks.includes(`section-${index}`))
          .map(({ section, index }) => (
          <div
            key={index}
            id={`section-${index}`}
            ref={(el) => { sectionRefs.current[index] = el }}
            className={`insight-section ${getSectionColor(index)} ${
              section.type === 'intro' ? 'intro-section' : ''
            } ${section.type === 'raw' ? 'raw-section' : ''}`}
          >
            <div className="section-header flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="section-icon">{getSectionIcon(section.title)}</span>
                <h3 className="truncate">
                  {section.type === 'intro' ? getLabel('overview') : section.type === 'raw' ? getLabel('analysis') : section.title}
                </h3>
                {bookmarks.includes(`section-${index}`) && (
                  <span className="text-amber-400 text-xs shrink-0" title="Bookmarked">★</span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleBookmark(index)}
                  className={`p-1.5 rounded text-xs transition-colors ${bookmarks.includes(`section-${index}`) ? 'text-amber-400' : 'text-neutral-500 hover:text-amber-300'}`}
                  aria-label={bookmarks.includes(`section-${index}`) ? 'Remove bookmark' : 'Bookmark'}
                >
                  ★
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(index)}
                  className="p-1.5 rounded text-xs text-neutral-500 hover:text-amber-300 transition-colors"
                  aria-label="Copy section"
                >
                  {copiedIndex === index ? '✓' : '⎘'}
                </button>
              </div>
            </div>

            <div className="section-content">
              {section.type === 'raw' ? (
                <div className="raw-text">{section.content}</div>
              ) : (
                <FormattedContent content={section.content} />
              )}
            </div>
          </div>
        ))}
      </div>
      {copiedIndex !== null && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-bazi-gold/90 text-bazi-ink text-sm font-medium animate-fade-in">
          {getLabel('copied')}
        </div>
      )}
    </div>
  );
};

/**
 * Rich content formatter for the comprehensive insights sections.
 * Handles **bold**, ### sub-headers, bullet points, numbered lists,
 * keyword:value patterns, imperative verb accents, and separators.
 *
 * Shares the same keyword set as SectionContent.jsx for consistency.
 */

// ── Positive / negative keyword sets (mirrors SectionContent.jsx) ──
const FC_POSITIVE = new Set([
  'Do', 'Focus on', 'Lucky Months', 'Opportunities', 'Recommendation', 'Action',
  '做', '專注', '專注於', '吉月', '機遇', '建議', '行動',
  '做', '专注', '专注于', '吉月', '机遇', '建议', '行动',
  '하세요', '집중', '길월', '기회', '조언', '행동',
]);
const FC_NEGATIVE = new Set([
  'Avoid', 'Caution Months', 'Challenges', 'Caution', 'Note',
  '避免', '凶月', '挑戰', '注意',
  '避免', '凶月', '挑战', '注意',
  '피하세요', '흉월', '도전', '주의',
]);

// All labels recognised as keyword lines (mirrors SectionContent.jsx)
const FC_ALL_LABELS = [
  // EN
  'Overview', 'Theme', 'Role', 'Interaction', 'Career', 'Relationships',
  'Meaning', 'This Year', 'This Season', 'This Month',
  'Why', 'Daily Actions', 'Key Impact',
  'Key Focus', 'Timing', 'Present', 'Missing',
  'Lucky Months', 'Caution Months',
  'Opportunities', 'Challenges',
  'Do', 'Avoid', 'Focus on',
  'Recommendation', 'Suggestion', 'Action', 'Caution', 'Note',
  'Q1', 'Q2', 'Q3', 'Q4',
  // Compatibility-specific
  'Analogy', 'Zodiac', 'Complementarity',
  // zh-TW
  '概述', '主題', '角色', '互動', '事業', '感情',
  '含義', '今年', '本季', '本月',
  '原因', '日常行動', '關鍵影響',
  '關鍵重點', '時機', '時間指引', '出現', '缺失',
  '吉月', '凶月', '機遇', '挑戰',
  '做', '避免', '專注', '專注於',
  '建議', '注意', '行動', '重點', '提示',
  // Compatibility-specific
  '比喻', '生肖', '互補',
  // zh-CN
  '概述', '主题', '角色', '互动', '事业', '感情',
  '含义', '今年', '本季', '本月',
  '原因', '日常行动', '关键影响',
  '关键重点', '时机', '时间指引', '出现', '缺失',
  '吉月', '凶月', '机遇', '挑战',
  '做', '避免', '专注', '专注于',
  '建议', '注意', '行动', '重点', '提示',
  // Compatibility-specific
  '比喻', '生肖', '互补',
  // Korean
  '개요', '주제', '역할', '상호작용', '직업', '인간관계',
  '의미', '올해', '이번 계절', '이번 달',
  '이유', '일상 행동', '핵심 영향',
  '핵심 초점', '시기', '출현', '결핍',
  '길월', '흉월', '기회', '도전',
  '하세요', '피하세요', '집중',
  '조언', '주의', '행동',
  // Compatibility-specific
  '비유', '띠', '상호보완',
];

const fcSorted = [...new Set(FC_ALL_LABELS)].sort((a, b) => b.length - a.length);
const fcEscaped = fcSorted.map(l => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
// (.*) allows empty value — label-only lines act as section headers
const FC_KW_RE = new RegExp(`^(${fcEscaped.join('|')}|Q[1-4](?:\\s*[（(][^)）]*[)）])?)[：:]\\s*(.*)$`);


const FormattedContent = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <p>No content available</p>;
  }

  const lines = content.split('\n');

  const renderInline = (text) => {
    if (!text || !text.includes('**')) return text;
    return text.split(/\*\*([^*]+)\*\*/).map((part, idx) => {
      if (idx % 2 === 1) {
        const isLabel = /[:：]\s*$/.test(part);
        return <strong key={idx} className={isLabel ? 'kw-label' : ''}>{part}</strong>;
      }
      return part || null;
    });
  };

  return (
    <div className="formatted-content">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" aria-hidden />;

        // Sub-header: ### or ####
        if (/^#{2,4}\s+/.test(trimmed)) {
          const text = trimmed.replace(/^#{2,4}\s+/, '');
          return (
            <h4 key={i} className="fc-subheader">
              <span className="fc-accent-bar" />
              {renderInline(text)}
            </h4>
          );
        }

        // Bullet points: - or *
        if (/^[-*]\s+/.test(trimmed)) {
          const text = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={i} className="fc-bullet">
              <span className="fc-bullet-dot">◆</span>
              <span>{renderInline(text)}</span>
            </div>
          );
        }

        // Numbered list: 1. or 1)
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
        if (numMatch) {
          return (
            <div key={i} className="fc-numbered">
              <span className="fc-num-circle">{numMatch[1]}</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Separator
        if (trimmed === '---' || trimmed === '***') {
          return <div key={i} className="section-divider" />;
        }

        // Keyword line: Label: value  OR  Label: (empty → section header)
        const kwMatch = trimmed.match(FC_KW_RE);
        if (kwMatch) {
          const label = kwMatch[1];
          const value = (kwMatch[2] || '').trim();
          const isNeg = FC_NEGATIVE.has(label);
          const isPos = FC_POSITIVE.has(label);

          if (!value) {
            // Label header (no value) — acts as section header for bullets below
            return (
              <div key={i} className={`fc-label-header ${isNeg ? 'fc-lh-neg' : isPos ? 'fc-lh-pos' : ''}`}>
                <span className={`fc-lh-bar ${isNeg ? 'fc-lh-bar-neg' : isPos ? 'fc-lh-bar-pos' : ''}`} />
                <span className="fc-lh-text">{label}</span>
              </div>
            );
          }

          return (
            <div key={i} className="fc-keyword-line">
              <span className={`fc-keyword ${isNeg ? 'fc-kw-avoid' : isPos ? 'fc-kw-do' : ''}`}>
                {label}:
              </span>
              <span>{renderInline(value)}</span>
            </div>
          );
        }

        // Regular paragraph (with inline bold support)
        return (
          <p key={i} className="content-line">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export default EnhancedInsightDisplay;
