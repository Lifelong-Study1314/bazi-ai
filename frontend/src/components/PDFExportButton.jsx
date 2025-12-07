import { useState } from 'react'
import { useExportPDF } from '../hooks/useExportPDF'
import PDFTemplate from './PDFTemplate'
import './PDFExportButton.css'

/**
 * PDF Export Button Component
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

  // Translation strings
  const translations = {
    en: {
      buttonText: '📥 Export PDF',
      modalTitle: 'Export as PDF',
      label: 'Filename:',
      hint: '(Timestamp and .pdf extension will be added automatically)',
      cancel: 'Cancel',
      export: 'Export',
      exporting: 'Exporting...'
    },
    'zh-CN': {
      buttonText: '📥 導出PDF',
      modalTitle: '導出為PDF',
      label: '文件名:',
      hint: '(文件名會自動添加時間戳和.pdf擴展名)',
      cancel: '取消',
      export: '導出',
      exporting: '導出中...'
    },
    'zh-TW': {
      buttonText: '📥 導出PDF',
      modalTitle: '導出為PDF',
      label: '文件名:',
      hint: '(文件名會自動添加時間戳和.pdf擴展名)',
      cancel: '取消',
      export: '導出',
      exporting: '導出中...'
    }
  }

  const t = translations[language] || translations.en

  return (
    <>
      {/* Render PDF Template (hidden) */}
      <PDFTemplate 
        userInfo={userInfo}
        baziData={baziData}
        insights={insights}
        language={language}
      />

      {/* Export Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isDisabled || !insights}
        className="pdf-export-btn"
        title={isDisabled || !insights ? 'Generate analysis first' : 'Export analysis to PDF'}
      >
        {t.buttonText}
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="pdf-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>{t.modalTitle}</h3>
              <button 
                className="pdf-modal-close" 
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="pdf-modal-body">
              <label className="pdf-modal-label">
                {t.label}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="pdf-modal-input"
                placeholder="Enter filename"
              />
              <p className="pdf-modal-hint">
                {t.hint}
              </p>
            </div>

            <div className="pdf-modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="pdf-modal-btn secondary"
                disabled={isExporting}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleExport}
                className="pdf-modal-btn primary"
                disabled={isExporting}
              >
                {isExporting ? t.exporting : t.export}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PDFExportButton