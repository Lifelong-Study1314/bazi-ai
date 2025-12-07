/**
 * PDF Export Hook - PROPER DOCUMENT APPROACH
 * Creates a clean, readable PDF document (not a screenshot)
 * Formats the analysis as a professional report
 * Fixes: Dark background, unreadable modal, poor layout
 */

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';

/**
 * Hook for creating professional PDF reports
 * Generates text-based PDF with proper formatting
 * No screenshots, pure document creation
 */
export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate professional PDF document from text content
   * Creates a clean, readable report
   * @param {object} params - Export parameters
   * @returns {Promise<boolean>} - Success status
   */
  const exportPDF = useCallback(async (params) => {
    try {
      setIsExporting(true);
      setError(null);

      const {
        htmlElement = null,
        textContent = '',
        filename = 'BAZI_Analysis.pdf',
        userData = {},
        language = 'en',
      } = params;

      // Extract text from HTML element if provided
      let contentText = textContent;
      if (htmlElement && !textContent) {
        contentText = htmlElement.innerText || htmlElement.textContent || '';
      }

      if (!contentText) {
        throw new Error('No content to export');
      }

      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set up fonts and colors
      const colors = {
        gold: [201, 169, 97],
        darkNavy: [26, 32, 53],
        darkGray: [80, 80, 80],
        lightGray: [150, 150, 150],
        black: [0, 0, 0],
        white: [255, 255, 255],
      };

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Function to add text with word wrapping
      const addWrappedText = (text, fontSize, color, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...color);
        if (isBold) {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }

        const lines = pdf.splitTextToSize(text, contentWidth);
        const lineHeight = fontSize * 0.35;

        lines.forEach((line) => {
          if (yPosition + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        yPosition += 2; // Spacing
        return lines.length;
      };

      // ===== HEADER =====
      // Background color
      pdf.setFillColor(...colors.darkNavy);
      pdf.rect(0, 0, pageWidth, 35, 'F');

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(...colors.gold);
      pdf.setFont(undefined, 'bold');
      pdf.text('BAZI Destiny Analysis', margin, 15);

      // Subtitle
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.white);
      pdf.setFont(undefined, 'normal');
      pdf.text('Professional Destiny Report', margin, 23);

      yPosition = 40;

      // ===== USER INFORMATION SECTION =====
      if (userData && Object.keys(userData).length > 0) {
        // Section title
        pdf.setFontSize(12);
        pdf.setTextColor(...colors.darkNavy);
        pdf.setFont(undefined, 'bold');
        pdf.text('Birth Information', margin, yPosition);
        yPosition += 8;

        // Draw a line
        pdf.setDrawColor(...colors.gold);
        pdf.line(margin, yPosition - 2, margin + 40, yPosition - 2);
        yPosition += 5;

        // User info table
        const infoData = [
          { label: 'Name', value: userData.name || 'N/A' },
          { label: 'Birth Date', value: userData.birthDate || 'N/A' },
          { label: 'Birth Time', value: userData.birthTime || 'N/A' },
          { label: 'Gender', value: userData.gender || 'N/A' },
        ];

        pdf.setFontSize(10);
        infoData.forEach((item) => {
          pdf.setTextColor(...colors.darkGray);
          pdf.setFont(undefined, 'bold');
          pdf.text(`${item.label}:`, margin + 2, yPosition);

          pdf.setTextColor(...colors.black);
          pdf.setFont(undefined, 'normal');
          pdf.text(item.value, margin + 50, yPosition);

          yPosition += 6;
        });

        yPosition += 5;
      }

      // ===== MAIN CONTENT SECTION =====
      pdf.setFontSize(12);
      pdf.setTextColor(...colors.darkNavy);
      pdf.setFont(undefined, 'bold');
      pdf.text('Analysis Report', margin, yPosition);
      yPosition += 8;

      // Draw a line
      pdf.setDrawColor(...colors.gold);
      pdf.line(margin, yPosition - 2, margin + 40, yPosition - 2);
      yPosition += 5;

      // Split content by paragraphs and sections
      const sections = contentText.split(/\n\n+/).filter((s) => s.trim());

      sections.forEach((section, index) => {
        const lines = section.trim().split('\n');

        lines.forEach((line) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;

          // Check if this is a heading (contains numbers like "1.", "2.", etc.)
          const isHeading = /^\d+\.|^##|^###/.test(trimmedLine);

          if (isHeading) {
            // Section heading
            if (yPosition > margin && yPosition < pageHeight - 30) {
              yPosition += 3; // Extra space before heading
            }

            pdf.setFontSize(11);
            pdf.setTextColor(...colors.darkNavy);
            pdf.setFont(undefined, 'bold');
            pdf.text(
              trimmedLine.replace(/^#+\s*/, ''),
              margin,
              yPosition
            );
            yPosition += 7;
          } else {
            // Regular text
            pdf.setFontSize(10);
            pdf.setTextColor(...colors.black);
            pdf.setFont(undefined, 'normal');

            const wrappedLines = pdf.splitTextToSize(trimmedLine, contentWidth);
            const lineHeight = 5.5;

            wrappedLines.forEach((wrappedLine) => {
              if (yPosition + lineHeight > pageHeight - margin) {
                pdf.addPage();

                // Re-add header on new pages
                pdf.setFillColor(...colors.darkNavy);
                pdf.rect(0, 0, pageWidth, 20, 'F');
                pdf.setFontSize(10);
                pdf.setTextColor(...colors.gold);
                pdf.text('BAZI Destiny Analysis (continued...)', margin, 10);

                yPosition = 25;
              }

              pdf.text(wrappedLine, margin, yPosition);
              yPosition += lineHeight;
            });
          }
        });

        // Space between sections
        yPosition += 3;
      });

      // ===== FOOTER =====
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(...colors.lightGray);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.lightGray);

        // Generated date
        const date = new Date().toLocaleDateString(
          language === 'zh-CN' ? 'zh-CN' : language === 'zh-TW' ? 'zh-TW' : 'en-US'
        );
        pdf.text(`Generated: ${date}`, margin, pageHeight - 10);

        // Page number
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );

        // Disclaimer
        pdf.setFontSize(7);
        pdf.setTextColor(...colors.lightGray);
        pdf.text(
          'This analysis is for reference only. Consult professionals for important decisions.',
          margin,
          pageHeight - 5
        );
      }

      // Save the PDF
      pdf.save(filename);
      console.log('PDF saved successfully:', filename);
      return true;
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(err.message || 'Failed to generate PDF');
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportPDF,
    isExporting,
    error,
  };
};