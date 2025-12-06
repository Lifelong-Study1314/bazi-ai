import React, { useState, useEffect } from 'react';
import './EnhancedInsightDisplay.css';



export const EnhancedInsightDisplay = ({ insights }) => {
  const [sections, setSections] = useState([]);



  useEffect(() => {
    if (!insights || typeof insights !== 'string') {
      setSections([]);
      return;
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
      const parts = insights.split(/###\s+/);
      
      // Skip first part (it's the intro we already processed)
      for (let i = 1; i < parts.length; i++) {
        const section = parts[i];
        if (!section || !section.trim || section.trim().length === 0) continue;
        const lines = section.split('\n');
        if (!lines || lines.length === 0) continue;



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
          content: insights,
          title: 'Analysis'
        }
      ]);
    }
  }, [insights]);



  const getSectionIcon = (title) => {
    const iconMap = {
      'Chart Structure': '📊',
      'Strength': '📊',
      'Career': '💼',
      'Finance': '💼',
      'Relationships': '💑',
      'Marriage': '💑',
      'Health': '🏥',
      'Wellness': '🏥',
      'Personality': '✨',
      'Character': '✨',
      'Luck': '🔄',
      'Timing': '⏰',
      'Guidance': '🎯',
      'Development': '🚀',
      '命盤': '📊',
      '職業': '💼',
      '關係': '💑',
      '健康': '🏥',
      '性格': '✨',
      '幸運': '🔄',
      '時機': '⏰',
      '人生': '🎯',
      '發展': '🚀',
      '命盘': '📊',
      '职业': '💼',
      '关系': '💑',
      '养生': '🏥',
      '幸运': '🔄',
      '时机': '⏰',
      '个人': '🚀',
      '사주': '📊',
      '직업': '💼',
      '관계': '💑',
      '건강': '🏥',
      '성격': '✨',
      '행운': '🔄',
      '시기': '⏰',
      '인생': '🎯',
      '발전': '🚀'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
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
              {section.type === 'raw' ? (
                <div className="raw-text">{section.content}</div>
              ) : (
                <FormattedContent content={section.content} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



// Helper to format content
const FormattedContent = ({ content }) => {
  if (!content || typeof content !== 'string') {
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



        // ✅ IMPROVED: Bullet points with more flexible regex
        // Matches: "- text", "* text", "• text" with or without spaces
        if (/^[-*•]\s*/.test(trimmed)) {
          // Remove the bullet character and optional whitespace
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