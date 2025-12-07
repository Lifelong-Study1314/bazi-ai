/**
 * Enhanced PDF Export Hook with Chinese Character Support - FIXED VERSION
 * Uses html2canvas for proper rendering (avoids jsPDF font issues)
 * Supports Simplified Chinese, Traditional Chinese, and English
 */

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Hook for exporting analysis to PDF
 * Handles multi-language PDFs with proper character rendering
 */
export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate PDF from HTML content - MOST RELIABLE METHOD
   * Converts HTML directly to image, avoiding font encoding issues
   * @param {HTMLElement} htmlElement - Element to convert to PDF
   * @param {string} filename - Output filename
   * @param {object} options - Export options
   * @returns {Promise<boolean>} - Success status
   */
  const generatePDFFromHTML = useCallback(
    async (htmlElement, filename, options = {}) => {
      try {
        setIsExporting(true);
        setError(null);

        if (!htmlElement) {
          throw new Error('HTML element not provided');
        }

        // Render HTML to canvas with high quality
        const canvas = await html2canvas(htmlElement, {
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
          backgroundColor: '#ffffff',
          letterRendering: true, // Better for text rendering
          imageTimeout: 0,
          ...options.canvasOptions,
        });

        const imgData = canvas.toDataURL('image/png');

        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF
        const pdf = new jsPDF({
          orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
          unit: 'mm',
          format: 'a4',
        });

        let yPosition = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add image, handling multi-page
        while (yPosition < imgHeight) {
          pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
          yPosition += pageHeight;
          if (yPosition < imgHeight) {
            pdf.addPage();
          }
        }

        // Save PDF
        pdf.save(filename);
        return true;
      } catch (err) {
        console.error('PDF generation error:', err);
        setError(err.message || 'Failed to generate PDF');
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  /**
   * Main export function - uses HTML2Canvas method (most reliable)
   * @param {object} params - Export parameters
   * @returns {Promise<boolean>} - Success status
   */
  const exportPDF = useCallback(
    async (params) => {
      const {
        htmlElement, // Element to render
        filename = 'BAZI_Analysis.pdf',
        language = 'en',
      } = params;

      if (!htmlElement) {
        setError('No content provided for PDF export');
        return false;
      }

      return generatePDFFromHTML(htmlElement, filename, {
        canvasOptions: {
          scale: 2,
          backgroundColor: '#ffffff',
          letterRendering: true,
        },
      });
    },
    [generatePDFFromHTML]
  );

  return {
    exportPDF,
    isExporting,
    error,
  };
};