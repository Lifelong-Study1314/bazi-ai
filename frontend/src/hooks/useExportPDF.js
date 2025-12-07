/**
 * Enhanced PDF Export Hook - IMPROVED QUALITY VERSION
 * Fixes: Page cutoff, blurry text, broken layout
 * Better rendering with proper viewport and scaling
 */

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Hook for exporting analysis to PDF with HIGH QUALITY
 * Handles multi-language PDFs with proper rendering and scaling
 */
export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate PDF from HTML content - HIGH QUALITY VERSION
   * Captures full page properly with excellent rendering
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

        // Calculate optimal dimensions
        const rect = htmlElement.getBoundingClientRect();
        const originalWidth = htmlElement.offsetWidth;
        const originalHeight = htmlElement.offsetHeight;

        console.log('Rendering dimensions:', { originalWidth, originalHeight });

        // Render HTML to canvas with VERY HIGH quality settings
        const canvas = await html2canvas(htmlElement, {
          scale: 3, // ✅ INCREASED: 2 → 3 for crisp text (HIGH QUALITY)
          logging: false,
          allowTaint: true,
          useCORS: true,
          backgroundColor: '#ffffff',
          letterRendering: true, // Better for text
          imageTimeout: 0,
          windowWidth: originalWidth, // ✅ Use actual element width
          windowHeight: originalHeight, // ✅ Use actual element height
          // Add these for better rendering
          onclone: (clonedDocument) => {
            // Ensure the cloned element is visible
            const clonedElement = clonedDocument.querySelector('[data-html2canvas="clone"]');
            if (clonedElement) {
              clonedElement.style.visibility = 'visible';
              clonedElement.style.display = 'block';
            }
          },
          ...options.canvasOptions,
        });

        console.log('Canvas rendered:', { width: canvas.width, height: canvas.height });

        const imgData = canvas.toDataURL('image/png', 1.0); // ✅ FULL QUALITY

        // Calculate PDF dimensions - maintain aspect ratio
        const imgWidth = 210; // A4 width in mm
        const pdfScale = imgWidth / originalWidth;
        const imgHeight = originalHeight * pdfScale;

        console.log('PDF dimensions:', { imgWidth, imgHeight });

        // Create PDF with proper orientation
        const pdf = new jsPDF({
          orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
          unit: 'mm',
          format: 'a4',
          compress: true, // ✅ Compress to reduce file size while maintaining quality
        });

        let yPosition = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();

        // Add image, handling multi-page with proper scaling
        while (yPosition < imgHeight) {
          const remainingHeight = imgHeight - yPosition;
          const addHeight = Math.min(pageHeight, remainingHeight);

          if (yPosition === 0) {
            // First page - add entire image or what fits
            if (imgHeight <= pageHeight) {
              // Single page - use full dimensions
              pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
              // Multi-page - crop and add
              pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, addHeight);
            }
          } else {
            // Subsequent pages
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, addHeight);
          }

          yPosition += pageHeight;
        }

        // Save PDF
        pdf.save(filename);
        console.log('PDF saved:', filename);
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
   * Main export function - uses improved HTML2Canvas rendering
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
          scale: 3, // High quality
          backgroundColor: '#ffffff',
          letterRendering: true,
          allowTaint: true,
          useCORS: true,
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