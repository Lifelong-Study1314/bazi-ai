import { useMemo } from 'react'
import './EnhancedInsightDisplay.css'

/**
 * Enhanced Insight Display Component
 * Parses and displays formatted BAZI insights with styled sections
 */
const EnhancedInsightDisplay = ({ insights = '' }) => {
  // Map section numbers to emojis
  const sectionEmojis = {
    1: '📊',
    2: '💼',
    3: '💕',
    4: '🏥',
    5: '🧠',
    6: '🌙',
    7: '🌟'
  };

  const sections = useMemo(() => {
    if (!insights || insights.trim().length === 0) {
      return [];
    }

    try {
      const parsedSections = [];
      
      // Split by lines to find intro content
      const lines = insights.split('\n');
      let introLines = [];
      let contentStartIdx = 0;

      // Find where numbered sections start (### 1., ### 2., etc.)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match "### 1." or "### 1" followed by section title
        if (/###\s+\d+\.?\s+/.test(line)) {
          contentStartIdx = i;
          break;
        }
      }

      // Everything before the first numbered section is intro
      if (contentStartIdx > 0) {
        introLines = lines.slice(0, contentStartIdx);
        const introText = introLines.map(l => l.trim()).filter(l => l && !l.startsWith('###')).join('\n');
        
        if (introText) {
          parsedSections.push({
            type: 'intro',
            content: introText,
            title: 'Overview',
            emoji: '🔮'
          });
        }
      }

      // Now parse the numbered sections
      const contentText = lines.slice(contentStartIdx).join('\n');
      
      // Match sections: ### 1. Title ... content ... until next ### [number]
      const sectionRegex = /###\s+(\d+)\.?\s*([^\n]+)\n([\s\S]*?)(?=###\s+\d|$)/g;
      let match;

      while ((match = sectionRegex.exec(contentText)) !== null) {
        const sectionNum = parseInt(match[1]);
        const title = match[2].trim();
        const content = match[3].trim();
        const emoji = sectionEmojis[sectionNum] || '🔮';

        if (content.length > 0) {
          parsedSections.push({
            type: 'section',
            emoji: emoji,
            title: title,
            content: content,
            sectionNum: sectionNum
          });
        }
      }

      // If no sections found, treat entire text as raw
      if (parsedSections.length === 0) {
        parsedSections.push({
          type: 'raw',
          title: 'Analysis',
          emoji: '🔮',
          content: insights.trim()
        });
      }

      return parsedSections;
    } catch (error) {
      console.error('Error parsing sections:', error);
      return [{
        type: 'raw',
        title: 'Analysis',
        emoji: '🔮',
        content: insights
      }];
    }
  }, [insights]);

  // Color scheme by emoji
  const getEmojiColor = (emoji) => {
    const colorMap = {
      '📊': 'section-blue',      // Chart Structure
      '💼': 'section-green',     // Career & Finance
      '💕': 'section-pink',      // Relationships & Marriage
      '🏥': 'section-green',     // Health & Wellness
      '🧠': 'section-purple',    // Personality & Character
      '🌙': 'section-orange',    // Luck Cycles & Timing
      '🌟': 'section-amber',     // Life Guidance & Development
      '🔮': 'section-teal'       // Default/Overview
    };
    return colorMap[emoji] || 'section-teal';
  };

  if (sections.length === 0) {
    return (
      <div className="enhanced-insights-container">
        <div className="insights-empty">
          <p>Insights will appear here...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-insights-container">
      <div className="insights-header">
        <h2>✨ Your BAZI Destiny Analysis</h2>
        <p className="insights-subtitle">A comprehensive reading of your life chart</p>
      </div>

      <div className="sections-wrapper">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`insight-section ${getEmojiColor(section.emoji)} ${
              section.type === 'intro' ? 'intro-section' : ''
            } ${section.type === 'raw' ? 'raw-section' : ''}`}
          >
            <div className="section-header">
              <span className="section-icon">{section.emoji}</span>
              <h3>{section.title}</h3>
            </div>

            <div className="section-content">
              <FormattedContent content={section.content} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Format content with markdown-like syntax
 * Supports: bold, bullet points, section dividers
 */
const FormattedContent = ({ content }) => {
  if (!content || content.trim().length === 0) {
    return <p>No content available</p>;
  }

  const lines = content.split('\n');

  return (
    <div className="formatted-content">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Bold text (between **)
        if (trimmed.includes('**')) {
          return (
            <p key={i} className="content-line">
              {trimmed.split(/\*\*([^*]+)\*\*/).map((part, idx) =>
                idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
              )}
            </p>
          );
        }

        // Bullet points - handle various formats
        if (/^[-*•]\s*/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•]\s*/, '');
          return (
            <div key={i} className="bullet-point">
              • {bulletText}
            </div>
          );
        }

        // Section separators
        if (trimmed === '---' || trimmed === '***') {
          return <div key={i} className="section-divider" />;
        }

        // Regular paragraph
        return (
          <p key={i} className="content-line">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};

export default EnhancedInsightDisplay;