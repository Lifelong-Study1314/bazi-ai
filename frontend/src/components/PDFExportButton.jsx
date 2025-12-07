import { useState, useRef } from 'react'
import { useExportPDF } from '../hooks/useExportPDF'
import PDFTemplate from './PDFTemplate'
import './PDFExportButton.css'

/**
 * PDF Export Button Component
 * Provides UI for exporting analysis to PDF
 */
const PDFExportButton = ({ 
  userInfo = {}, 
  baziData = {}, 
  insights = '',
  language = 'en',
  isDisabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [customName, setCustomName] = useState(userInfo.name || 'BAZI_Analysis')
  const { generatePDF } = useExportPDF()

  const handleExport = async () => {
    setIsExporting(true)
    
    const filename = `${customName}_${new Date().getTime()}.pdf`
    const success = await generatePDF(insights, filename, userInfo)
    
    if (success) {
      setShowModal(false)
      setCustomName(userInfo.name || 'BAZI_Analysis')
    }
    
    setIsExporting(false)
  }

  const getButtonText = () => {
    if (language === 'zh-CN') return '📥 導出PDF'
    if (language === 'zh-TW') return '📥 導出PDF'
    return '📥 Export PDF'
  }

  const getModalTitle = () => {
    if (language === 'zh-CN') return '導出為PDF'
    if (language === 'zh-TW') return '導出為PDF'
    return 'Export as PDF'
  }

  const getLabel = () => {
    if (language === 'zh-CN') return '文件名:'
    if (language === 'zh-TW') return '文件名:'
    return 'Filename:'
  }

  return (
    <>
      {/* Hidden PDF Template for rendering */}
      <div style={{ display: 'none' }}>
        <PDFTemplate 
          userInfo={userInfo}
          baziData={baziData}
          insights={insights}
          language={language}
        />
      </div>

      {/* Export Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isDisabled || !insights}
        className="pdf-export-btn"
        title={isDisabled || !insights ? 'Generate analysis first' : 'Export analysis to PDF'}
      >
        {getButtonText()}
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="pdf-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>{getModalTitle()}</h3>
              <button 
                className="pdf-modal-close" 
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="pdf-modal-body">
              <label className="pdf-modal-label">
                {getLabel()}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="pdf-modal-input"
                placeholder="Enter filename"
              />
              <p className="pdf-modal-hint">
                {language === 'zh-CN' 
                  ? '(文件名會自動添加時間戳和.pdf擴展名)'
                  : language === 'zh-TW'
                  ? '(文件名會自動添加時間戳和.pdf擴展名)'
                  : '(Timestamp and .pdf extension will be added automatically)'}
              </p>
            </div>

            <div className="pdf-modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="pdf-modal-btn secondary"
                disabled={isExporting}
              >
                {language === 'zh-CN' ? '取消' : language === 'zh-TW' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleExport}
                className="pdf-modal-btn primary"
                disabled={isExporting}
              >
                {isExporting 
                  ? (language === 'zh-CN' ? '導出中...' : language === 'zh-TW' ? '導出中...' : 'Exporting...')
                  : (language === 'zh-CN' ? '導出' : language === 'zh-TW' ? '導出' : 'Export')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PDFExportButton