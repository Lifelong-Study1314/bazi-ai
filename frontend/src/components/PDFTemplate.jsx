import './PDFTemplate.css'

/**
 * PDF Template Component
 * Rendered for PDF export - optimized for print
 */
const PDFTemplate = ({ 
  userInfo = {}, 
  baziData = {}, 
  insights = '',
  language = 'en'
}) => {
  const {
    name = 'User',
    birthDate = '',
    birthTime = '',
    gender = 'Unknown'
  } = userInfo;

  const {
    elements = {},
    dayMaster = {},
    fourPillars = {}
  } = baziData;

  const yearPillar = fourPillars.year ? 
    `${fourPillars.year.stem?.name_cn || ''}${fourPillars.year.branch?.name_cn || ''}` : '';
  const monthPillar = fourPillars.month ? 
    `${fourPillars.month.stem?.name_cn || ''}${fourPillars.month.branch?.name_cn || ''}` : '';
  const dayPillar = fourPillars.day ? 
    `${fourPillars.day.stem?.name_cn || ''}${fourPillars.day.branch?.name_cn || ''}` : '';
  const hourPillar = fourPillars.hour ? 
    `${fourPillars.hour.stem?.name_cn || ''}${fourPillars.hour.branch?.name_cn || ''}` : '';

  const elementCounts = elements.counts || {};
  const elementBalance = elements.analysis?.balance || 'Unknown';

  const getTitle = () => {
    if (language === 'zh-CN') return '八字命盤分析報告';
    if (language === 'zh-TW') return '八字命盤分析報告';
    return 'BAZI Destiny Analysis Report';
  };

  const getLabel = (key) => {
    const labels = {
      en: {
        name: 'Name',
        birthDate: 'Birth Date',
        birthTime: 'Birth Time',
        gender: 'Gender',
        fourPillars: 'Four Pillars',
        year: 'Year',
        month: 'Month',
        day: 'Day',
        hour: 'Hour',
        elements: 'Five Elements',
        dayMaster: 'Day Master',
        balance: 'Balance Status',
        generatedOn: 'Generated on'
      },
      'zh-CN': {
        name: '姓名',
        birthDate: '出生日期',
        birthTime: '出生時間',
        gender: '性別',
        fourPillars: '四柱八字',
        year: '年柱',
        month: '月柱',
        day: '日柱',
        hour: '時柱',
        elements: '五行統計',
        dayMaster: '日主',
        balance: '平衡狀態',
        generatedOn: '生成時間'
      },
      'zh-TW': {
        name: '姓名',
        birthDate: '出生日期',
        birthTime: '出生時間',
        gender: '性別',
        fourPillars: '四柱八字',
        year: '年柱',
        month: '月柱',
        day: '日柱',
        hour: '時柱',
        elements: '五行統計',
        dayMaster: '日主',
        balance: '平衡狀態',
        generatedOn: '生成時間'
      }
    };

    return labels[language]?.[key] || labels.en[key];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(language.startsWith('zh') ? 'zh-Hans-CN' : 'en-US');
  };

  return (
    <div id="pdf-content" className="pdf-template">
      {/* Header */}
      <div className="pdf-header">
        <h1 className="pdf-title">{getTitle()}</h1>
        <p className="pdf-subtitle">Professional BAZI Chart Analysis</p>
      </div>

      {/* User Information Section */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">📋 {getLabel('name')}</h2>
        <table className="pdf-info-table">
          <tbody>
            <tr>
              <td className="label">{getLabel('name')}:</td>
              <td className="value">{name}</td>
            </tr>
            <tr>
              <td className="label">{getLabel('birthDate')}:</td>
              <td className="value">{formatDate(birthDate)}</td>
            </tr>
            <tr>
              <td className="label">{getLabel('birthTime')}:</td>
              <td className="value">{birthTime || 'N/A'}</td>
            </tr>
            <tr>
              <td className="label">{getLabel('gender')}:</td>
              <td className="value">{gender}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Four Pillars Section */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">☯️ {getLabel('fourPillars')}</h2>
        <table className="pdf-pillars-table">
          <tbody>
            <tr>
              <td className="label">{getLabel('year')}:</td>
              <td className="value">{yearPillar}</td>
            </tr>
            <tr>
              <td className="label">{getLabel('month')}:</td>
              <td className="value">{monthPillar}</td>
            </tr>
            <tr>
              <td className="label">{getLabel('day')}:</td>
              <td className="value">{dayPillar}</td>
            </tr>
            <tr>
              <td className="label">{getLabel('hour')}:</td>
              <td className="value">{hourPillar}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Five Elements Section */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">🔥 {getLabel('elements')}</h2>
        <table className="pdf-elements-table">
          <tbody>
            <tr>
              <td className="element-cell wood">
                <span className="element-name">木 (Wood)</span>
                <span className="element-count">{elementCounts.Wood || 0}</span>
              </td>
              <td className="element-cell fire">
                <span className="element-name">火 (Fire)</span>
                <span className="element-count">{elementCounts.Fire || 0}</span>
              </td>
              <td className="element-cell earth">
                <span className="element-name">土 (Earth)</span>
                <span className="element-count">{elementCounts.Earth || 0}</span>
              </td>
              <td className="element-cell metal">
                <span className="element-name">金 (Metal)</span>
                <span className="element-count">{elementCounts.Metal || 0}</span>
              </td>
              <td className="element-cell water">
                <span className="element-name">水 (Water)</span>
                <span className="element-count">{elementCounts.Water || 0}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="pdf-info">
          <p><strong>{getLabel('dayMaster')}:</strong> {dayMaster.element || 'N/A'}</p>
          <p><strong>{getLabel('balance')}:</strong> {elementBalance}</p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="pdf-section">
        <h2 className="pdf-section-title">📊 {language === 'zh-CN' ? '詳細分析' : language === 'zh-TW' ? '詳細分析' : 'Detailed Analysis'}</h2>
        <div className="pdf-insights-content">
          {/* Parse and render insights */}
          {insights && renderInsightsSections(insights, language)}
        </div>
      </div>

      {/* Footer */}
      <div className="pdf-footer">
        <p>{getLabel('generatedOn')}: {new Date().toLocaleString(language.startsWith('zh') ? 'zh-Hans-CN' : 'en-US')}</p>
        <p className="disclaimer">
          {language === 'zh-CN' 
            ? '本報告由AI驅動的八字分析系統生成，僅供參考。'
            : language === 'zh-TW'
            ? '本報告由AI驅動的八字分析系統生成，僅供參考。'
            : 'This report is generated by an AI-powered BAZI analysis system for reference only.'}
        </p>
      </div>
    </div>
  );
};

/**
 * Parse and render insights sections for PDF
 */
function renderInsightsSections(insights, language) {
  if (!insights) return null;

  const lines = insights.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Detect section headers
    if (/###\s+\d+\.?\s+/.test(trimmed)) {
      const match = trimmed.match(/###\s+\d+\.?\s+([^\n]+)/);
      if (currentSection && currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: match ? match[1] : '',
        content: []
      };
    } else if (currentSection && trimmed.length > 0 && !trimmed.startsWith('###')) {
      currentSection.content.push(trimmed);
    }
  });

  // Add last section
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return (
    <>
      {sections.map((section, idx) => (
        <div key={idx} className="pdf-insight-section">
          <h3 className="pdf-subsection-title">{section.title}</h3>
          {section.content.map((content, contentIdx) => (
            <p key={contentIdx} className="pdf-content-line">
              {content}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}

export default PDFTemplate;