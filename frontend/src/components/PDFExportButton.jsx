/**
 * PDF Export Button Component - FIXED VERSION
 * Uses HTML rendering method (avoids Unicode encoding errors)
 * Supports multi-language with proper character rendering
 */

import { useState, useRef } from 'react';
import { useExportPDF } from '../hooks/useExportPDF';
import './PDFExportButton.css';

const PDFExportButton = ({
  userInfo = {},
  baziData = {},
  insights = '',
  language = 'en',
  isDisabled = false,
}) => {
  const { exportPDF, isExporting, error: exportError } = useExportPDF();
  const [showModal, setShowModal] = useState(false);
  const [customName, setCustomName] = useState(
    `${userInfo.name || 'BAZI'}_Analysis`
  );
  const [showError, setShowError] = useState(false);
  const containerRef = useRef(null);

  // Localization
  const labels = {
    en: {
      button: 'Export PDF',
      modal: 'Export as PDF',
      filename: 'Filename',
      hint: 'Timestamp and .pdf extension will be added automatically',
      cancel: 'Cancel',
      export: 'Export',
      exporting: 'Exporting...',
    },
    'zh-CN': {
      button: '导出PDF',
      modal: '导出为PDF',
      filename: '文件名',
      hint: '时间戳和.pdf后缀会自动添加',
      cancel: '取消',
      export: '导出',
      exporting: '导出中...',
    },
    'zh-TW': {
      button: '匯出PDF',
      modal: '匯出為PDF',
      filename: '檔案名稱',
      hint: '時間戳和.pdf副檔名會自動添加',
      cancel: '取消',
      export: '匯出',
      exporting: '匯出中...',
    },
  };

  const currentLabels = labels[language] || labels.en;

  /**
   * Handle PDF export using HTML rendering
   * This method renders the current page view to PDF
   */
  const handleExport = async () => {
    try {
      setShowError(false);

      // Get the main content container to export
      // This will include the analysis results visible on screen
      const exportContainer = document.querySelector('.results-display');
      
      if (!exportContainer) {
        console.error('Results container not found');
        setShowError(true);
        return;
      }

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `${customName}_${timestamp}.pdf`;

      // Export PDF
      const success = await exportPDF({
        htmlElement: exportContainer,
        filename,
        language,
      });

      if (success) {
        setShowModal(false);
        setCustomName(`${userInfo.name || 'BAZI'}_Analysis`);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('Export error:', error);
      setShowError(true);
    }
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isDisabled || !insights}
        className="pdf-export-btn"
        title={isDisabled || !insights ? 'Generate analysis first' : 'Export analysis to PDF'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {currentLabels.button}
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="pdf-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="pdf-modal-header">
              <h3>{currentLabels.modal}</h3>
              <button
                className="pdf-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="pdf-modal-body">
              <label className="pdf-modal-label">{currentLabels.filename}</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="pdf-modal-input"
                placeholder="Enter filename"
                disabled={isExporting}
              />
              <p className="pdf-modal-hint">
                {currentLabels.hint}
              </p>

              {/* Error Message */}
              {(showError || exportError) && (
                <div className="pdf-modal-error">
                  <p>Failed to export PDF. Please try again.</p>
                  {exportError && <small>{exportError}</small>}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pdf-modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="pdf-modal-btn secondary"
                disabled={isExporting}
              >
                {currentLabels.cancel}
              </button>
              <button
                onClick={handleExport}
                className="pdf-modal-btn primary"
                disabled={isExporting || !customName.trim()}
              >
                {isExporting ? currentLabels.exporting : currentLabels.export}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PDFExportButton;