import React from 'react'
import { stripDisclaimers } from '../utils/stripDisclaimers'

/**
 * Renders AI-generated section content with clean formatting.
 * - Strips AI disclaimer phrases (e.g. "以上内容由DeepSeek生成，仅供娱乐参考")
 * - Splits on newlines, renders as paragraphs
 * - Parses **text** and renders as <strong>text</strong>
 * - Handles bullet points (- or *) and numbered lists
 */
export const SectionContent = React.memo(({ content, className = '' }) => {
  if (!content || typeof content !== 'string') {
    return null
  }

  const cleanedContent = stripDisclaimers(content)
  const lines = cleanedContent.split('\n')

  const renderLine = (line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return null

    // Bold text (between **)
    const renderWithBold = (text) => {
      if (!text.includes('**')) return text
      const parts = text.split(/\*\*([^*]+)\*\*/)
      return parts.map((part, idx) =>
        idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
      )
    }

    // Bullet points starting with * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 text-inherit">
          <span className="text-amber-400 shrink-0">•</span>
          <span>{renderWithBold(trimmed.replace(/^[-*]\s*/, ''))}</span>
        </div>
      )
    }

    // Numbered list (1. 2. 3. etc)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (numMatch) {
      return (
        <div key={i} className="flex gap-2 text-inherit">
          <span className="text-amber-400 shrink-0 font-medium">{numMatch[1]}.</span>
          <span>{renderWithBold(numMatch[2])}</span>
        </div>
      )
    }

    // Regular paragraph
    return (
      <p key={i} className="mb-2 last:mb-0 text-inherit">
        {renderWithBold(trimmed)}
      </p>
    )
  }

  return (
    <div className={`section-content space-y-2 text-sm text-amber-50 ${className}`.trim()}>
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  )
})

SectionContent.displayName = 'SectionContent'

export default SectionContent
