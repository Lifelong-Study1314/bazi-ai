import { useMemo } from 'react'
import './EnhancedInsightDisplay.css'

/**
 * Enhanced Insight Display Component
 * Parses and displays formatted BAZI insights with styled sections
 */
const EnhancedInsightDisplay = ({ insights = '' }) => {
  const sections = useMemo(() => {
    if (!insights || insights.trim().length === 0) {
      return [];
    }

    try {
      const parsedSections = [];
      
      // Extract the intro (everything before first ###)
      const introMatch = insights.match(/^([\s\S]*?)(###\s+\d+\.)/);
      const intro = introMatch ? introMatch[1] : '';
      
      if (intro && intro.trim().length > 0) {
        parsedSections.push({
          type: 'intro',
          content: intro.trim(),
          title: 'Overview'
        });
      }

      // Now split by ### markers
      const sectionRegex = /###\s+\d+\.\s*([^\n]+)\n([\s\S]*?)(?=###\s+\d+\.|$)/g;
      let match;

      while ((match = sectionRegex.exec(insights)) !== null) {
        const title = match[1].trim();
        const content = match[2].trim();

        if (content.length > 0) {
          parsedSections.push({
            type: 'section',
            title: title,
            content: content
          });
        }
      }

      // If no sections found, treat entire text as raw
      if (parsedSections.length === 0) {
        parsedSections.push({
          type: 'raw',
          title: 'Analysis',
          content: insights.trim()
        });
      }

      return parsedSections;
    } catch (error) {
      console.error('Error parsing sections:', error);
      return [{
        type: 'raw',
        title: 'Analysis',
        content: insights
      }];
    }
  }, [insights]);

  const getSectionIcon = (title) => {
    const icons = {
      'Chart Structure': '📊',
      'Career': '💼',
      'Finance': '💰',
      'Relationships': '💑',
      'Marriage': '💍',
      'Health': '🏥',
      'Wellness': '🧘',
      'Personality': '🎭',
      'Character': '✨',
      'Luck Cycles': '🔄',
      'Timing': '⏰',
      'Life Guidance': '🧭',
      'Development': '🚀'
    };

    for (const [key, icon] of Object.entries(icons)) {
      if (title.includes(key)) return icon;
    }
    return '📌';
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
            className={`insight-section ${getSectionColor(index)} ${
              section.type === 'intro' ? 'intro-section' : ''
            } ${section.type === 'raw' ? 'raw-section' : ''}`}
          >
            <div className="section-header">
              <span className="section-icon">{getSectionIcon(section.title)}</span>
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

        // Bullet points - IMPROVED regex to be more flexible
        // Matches: "- text", "* text", "• text", or lines starting with these characters
        if (/^[-*•]\s*/.test(trimmed)) {
          // Remove the bullet character and optional space
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