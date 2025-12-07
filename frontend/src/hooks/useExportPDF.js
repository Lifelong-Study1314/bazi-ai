/**
 * Enhanced PDF Export Hook with Chinese Character Support
 * Uses jsPDF + html2canvas with proper font handling
 * Supports Simplified Chinese, Traditional Chinese, and English
 */

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  initializeFonts, 
  setSmartFont, 
  detectLanguageFont, 
  hasChinese,
  wrapText 
} from '../utils/font-utils';

/**
 * Hook for exporting analysis to PDF
 * Handles multi-language PDFs with proper character encoding
 */
export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate PDF from HTML content
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

        // Render HTML to canvas
        const canvas = await html2canvas(htmlElement, {
          scale: 2,
          logging: false,
          allowTaint: true,
          useCORS: true,
          backgroundColor: '#ffffff',
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

        // Download
        pdf.save(filename);
        return true;
      } catch (err) {
        console.error('PDF generation error:', err);
        setError(err.message);
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  /**
   * Generate PDF with structured text content
   * Better for multi-language text with proper font handling
   * @param {string} content - Text content to export
   * @param {string} filename - Output filename
   * @param {object} userData - User information for header
   * @param {string} language - Language code (en, zh-CN, zh-TW)
   * @returns {Promise<boolean>} - Success status
   */
  const generatePDFWithFonts = useCallback(
    async (content, filename, userData, language = 'en') => {
      try {
        setIsExporting(true);
        setError(null);

        // Initialize PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Initialize fonts
        initializeFonts(pdf);

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        let yPosition = margin;

        // Color definitions
        const colors = {
          gold: { r: 201, g: 169, b: 97 },
          darkNavy: { r: 26, g: 32, b: 53 },
          darkGray: { r: 102, g: 102, b: 102 },
          black: { r: 0, g: 0, b: 0 },
        };

        // Helper to check page space
        const checkPageSpace = (height) => {
          if (yPosition + height > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
        };

        // Header
        pdf.setFillColor(colors.darkNavy.r, colors.darkNavy.g, colors.darkNavy.b);
        pdf.rect(0, 0, pageWidth, 30, 'F');

        pdf.setTextColor(colors.gold.r, colors.gold.g, colors.gold.b);
        pdf.setFontSize(24);
        setSmartFont(pdf, 'BAZI Destiny Analysis');
        pdf.text('BAZI Destiny Analysis', margin, 15);

        yPosition = 35;

        // User Information Section
        if (userData) {
          checkPageSpace(20);
          pdf.setTextColor(colors.darkGray.r, colors.darkGray.g, colors.darkGray.b);
          pdf.setFontSize(11);
          setSmartFont(pdf, 'Birth Information');
          pdf.text('Birth Information', margin, yPosition);
          yPosition += 6;

          // User data rows
          const infoData = [
            { label: 'Name', value: userData.name || 'N/A' },
            { label: 'Date', value: userData.birthDate || 'N/A' },
            { label: 'Time', value: userData.birthTime || 'N/A' },
            { label: 'Gender', value: userData.gender || 'N/A' },
          ];

          pdf.setFontSize(10);
          infoData.forEach((item) => {
            checkPageSpace(5);
            pdf.setTextColor(0, 0, 0);
            setSmartFont(pdf, item.label);
            pdf.text(`${item.label}:`, margin + 2, yPosition);
            setSmartFont(pdf, item.value);
            pdf.text(item.value, margin + 40, yPosition);
            yPosition += 5;
          });

          yPosition += 5;
        }

        // Main Content Section
        if (content) {
          checkPageSpace(10);
          pdf.setTextColor(colors.darkGray.r, colors.darkGray.g, colors.darkGray.b);
          pdf.setFontSize(11);
          setSmartFont(pdf, 'Analysis');
          pdf.text('Analysis', margin, yPosition);
          yPosition += 6;

          // Split content into paragraphs
          const paragraphs = content.split('\n\n');

          pdf.setFontSize(10);
          paragraphs.forEach((paragraph) => {
            if (!paragraph.trim()) return;

            // Wrap text with proper language detection
            const lines = pdf.splitTextToSize(paragraph, contentWidth);

            lines.forEach((line) => {
              checkPageSpace(5);
              pdf.setTextColor(0, 0, 0);
              setSmartFont(pdf, line);
              pdf.text(line, margin, yPosition);
              yPosition += 5;
            });

            yPosition += 2; // Paragraph spacing
          });
        }

        // Footer
        checkPageSpace(10);
        const pageCount = pdf.internal.pages.length - 1;
        pdf.setFontSize(9);
        pdf.setTextColor(colors.darkGray.r, colors.darkGray.g, colors.darkGray.b);
        pdf.text(
          `Generated: ${new Date().toLocaleString(language === 'zh-CN' ? 'zh-CN' : language === 'zh-TW' ? 'zh-TW' : 'en-US')}`,
          margin,
          pageHeight - 10
        );
        pdf.text(
          `Page ${pdf.internal.getNumberOfPages()} of ${pageCount}`,
          pageWidth - margin - 30,
          pageHeight - 10
        );

        // Disclaimer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        setSmartFont(pdf, 'Disclaimer');
        pdf.text('This analysis is for reference only.', margin, pageHeight - 5);

        // Save PDF
        pdf.save(filename);
        return true;
      } catch (err) {
        console.error('PDF generation error:', err);
        setError(err.message);
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  /**
   * Main export function - choose method automatically
   * @param {object} params - Export parameters
   * @returns {Promise<boolean>} - Success status
   */
  const exportPDF = useCallback(
    async (params) => {
      const {
        htmlElement, // For HTML2Canvas method
        textContent, // For text-based method
        filename = 'BAZI_Analysis.pdf',
        userData = {},
        language = 'en',
        useHTML2Canvas = false, // Set true for complex layouts
      } = params;

      if (useHTML2Canvas && htmlElement) {
        return generatePDFFromHTML(htmlElement, filename, {
          canvasOptions: { scale: 2 },
        });
      } else if (textContent) {
        return generatePDFWithFonts(textContent, filename, userData, language);
      } else {
        setError('No content provided for PDF export');
        return false;
      }
    },
    [generatePDFFromHTML, generatePDFWithFonts]
  );

  return {
    exportPDF,
    isExporting,
    error,
  };
};