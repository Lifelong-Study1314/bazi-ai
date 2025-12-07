/**
 * PDF Export Button Component
 * Integrates Chinese-compatible PDF export into analysis results
 * Supports multi-language with proper character encoding
 */

import { useState } from 'react';
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
   * Handle PDF export
   * Combines user data, bazi info, and insights into structured PDF
   */
  const handleExport = async () => {
    try {
      setShowError(false);

      // Create formatted content for PDF
      const timestamp = new Date().getTime();
      const filename = `${customName}_${timestamp}.pdf`;

      // Prepare user data for PDF
      const pdfUserData = {
        name: userInfo.name || 'Unknown',
        birthDate: baziData.birthDate || 'N/A',
        birthTime: baziData.birthTime || 'N/A',
        gender: baziData.gender || 'N/A',
      };

      // Prepare structured text content
      let pdfContent = '';

      // Add Five Elements Summary
      if (baziData.elements) {
        pdfContent += 'Five Elements Balance:\n\n';
        const elements = baziData.elements;
        pdfContent += `Wood: ${elements.wood || 0}\n`;
        pdfContent += `Fire: ${elements.fire || 0}\n`;
        pdfContent += `Earth: ${elements.earth || 0}\n`;
        pdfContent += `Metal: ${elements.metal || 0}\n`;
        pdfContent += `Water: ${elements.water || 0}\n\n`;
      }

      // Add Four Pillars if available
      if (baziData.pillars) {
        pdfContent += 'Four Pillars:\n\n';
        pdfContent += `Year: ${baziData.pillars.year || 'N/A'}\n`;
        pdfContent += `Month: ${baziData.pillars.month || 'N/A'}\n`;
        pdfContent += `Day: ${baziData.pillars.day || 'N/A'}\n`;
        pdfContent += `Hour: ${baziData.pillars.hour || 'N/A'}\n\n`;
      }

      // Add insights
      if (insights) {
        pdfContent += 'Analysis:\n\n';
        pdfContent += insights;
      }

      // Export with proper font handling for Chinese
      const success = await exportPDF({
        textContent: pdfContent,
        filename,
        userData: pdfUserData,
        language,
        useHTML2Canvas: false, // Use text-based method for better font support
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

  /**
   * Handle HTML2Canvas export (for styled layouts)
   * Alternative method if needed
   */
  const handleExportHTML = async () => {
    try {
      setShowError(false);
      const timestamp = new Date().getTime();
      const filename = `${customName}_${timestamp}.pdf`;

      // Find the PDF container element
      const pdfContainer = document.getElementById('pdf-export-container');
      if (!pdfContainer) {
        setShowError(true);
        return;
      }

      const success = await exportPDF({
        htmlElement: pdfContainer,
        filename,
        userData: {
          name: userInfo.name || 'Unknown',
          birthDate: baziData.birthDate || 'N/A',
          birthTime: baziData.birthTime || 'N/A',
          gender: baziData.gender || 'N/A',
        },
        language,
        useHTML2Canvas: true,
      });

      if (success) {
        setShowModal(false);
        setCustomName(`${userInfo.name || 'BAZI'}_Analysis`);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('HTML Export error:', error);
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
              {showError && (
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