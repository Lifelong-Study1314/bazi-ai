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
    day_master = {},
    four_pillars = {}
  } = baziData;

  const yearPillar = four_pillars.year ? 
    `${four_pillars.year.stem?.name_cn || ''}${four_pillars.year.branch?.name_cn || ''}` : '';
  const monthPillar = four_pillars.month ? 
    `${four_pillars.month.stem?.name_cn || ''}${four_pillars.month.branch?.name_cn || ''}` : '';
  const dayPillar = four_pillars.day ? 
    `${four_pillars.day.stem?.name_cn || ''}${four_pillars.day.branch?.name_cn || ''}` : '';
  const hourPillar = four_pillars.hour ? 
    `${four_pillars.hour.stem?.name_cn || ''}${four_pillars.hour.branch?.name_cn || ''}` : '';

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
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div id="pdf-content" className="pdf-template" style={{ display: 'none' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #c9a961' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 10px 0', letterSpacing: '1px' }}>
          {getTitle()}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0', fontStyle: 'italic' }}>
          Professional BAZI Chart Analysis
        </p>
      </div>

      {/* User Information Section */}
      <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#c9a961', margin: '0 0 15px 0', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
          📋 {getLabel('name')}
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('name')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {name}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('birthDate')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {formatDate(birthDate)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('birthTime')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {birthTime || 'N/A'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('gender')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {gender}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Four Pillars Section */}
      <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#c9a961', margin: '0 0 15px 0', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
          ☯️ {getLabel('fourPillars')}
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('year')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {yearPillar}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('month')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {monthPillar}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('day')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {dayPillar}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', width: '30%', color: '#555' }}>
                {getLabel('hour')}:
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #e0e0e0', color: '#333' }}>
                {hourPillar}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Five Elements Section */}
      <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#c9a961', margin: '0 0 15px 0', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
          🔥 {getLabel('elements')}
        </h2>
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #c9a961' }}>
          <p style={{ margin: '8px 0', fontSize: '14px' }}>
            <strong>{getLabel('dayMaster')}:</strong> {day_master.element || 'N/A'}
          </p>
          <p style={{ margin: '8px 0', fontSize: '14px' }}>
            <strong>{getLabel('balance')}:</strong> {elementBalance}
          </p>
        </div>
      </div>

      {/* Insights Section */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#c9a961', margin: '0 0 15px 0', paddingBottom: '8px', borderBottom: '1px solid #e0e0e0' }}>
          📊 Analysis
        </h2>
        <div style={{ marginTop: '15px' }}>
          {insights && renderInsights(insights)}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #c9a961', fontSize: '12px', color: '#888' }}>
        <p style={{ margin: '5px 0' }}>
          {getLabel('generatedOn')}: {new Date().toLocaleString()}
        </p>
        <p style={{ fontStyle: 'italic', color: '#999', marginTop: '10px' }}>
          This report is generated by an AI-powered BAZI analysis system for reference only.
        </p>
      </div>
    </div>
  );
};

function renderInsights(insights) {
  if (!insights) return null;

  const lines = insights.split('\n');
  const elements = [];
  let buffer = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    if (/###\s+\d+\.?\s+/.test(trimmed)) {
      if (buffer.length > 0) {
        elements.push(
          <div key={elements.length} style={{ marginBottom: '15px' }}>
            {buffer.map((text, idx) => (
              <p key={idx} style={{ margin: '8px 0', fontSize: '13px', lineHeight: '1.5', color: '#444' }}>
                {text}
              </p>
            ))}
          </div>
        );
        buffer = [];
      }
      const match = trimmed.match(/###\s+\d+\.?\s+([^\n]+)/);
      if (match) {
        elements.push(
          <h3 key={elements.length} style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50', margin: '12px 0 8px 0' }}>
            {match[1]}
          </h3>
        );
      }
    } else if (trimmed && !trimmed.startsWith('###')) {
      buffer.push(trimmed);
    }
  });

  if (buffer.length > 0) {
    elements.push(
      <div key={elements.length} style={{ marginBottom: '15px' }}>
        {buffer.map((text, idx) => (
          <p key={idx} style={{ margin: '8px 0', fontSize: '13px', lineHeight: '1.5', color: '#444' }}>
            {text}
          </p>
        ))}
      </div>
    );
  }

  return elements;
}

export default PDFTemplate;