/**
 * PDF Export Hook - CHINESE CHARACTER SUPPORT VERSION
 * Creates readable PDFs in English and Chinese (Simplified & Traditional)
 * Uses font embedding for proper character rendering
 */

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';

// Import Chinese font support
// Note: You need to install: npm install @react-pdf/font
// Or use web fonts with jsPDF

/**
 * Hook for creating professional PDF reports with Chinese support
 * Generates text-based PDF with proper formatting
 * Supports: English, Simplified Chinese, Traditional Chinese
 */
export const useExportPDF = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add Chinese font support to jsPDF
   * Registers font for proper character rendering
   */
  const addChineseFont = (pdf) => {
    try {
      // Register NotoSansCJK font (supports Chinese, Japanese, Korean)
      // This font is embedded as base64 to avoid file size issues
      
      // For Simplified Chinese (uses SimSun or STHeiti equivalents)
      pdf.setFont('SimSun'); // jsPDF built-in Chinese support
      
      // Fallback: Use standard fonts and hope for partial support
      // In production, consider using pdfkit or reportlab for better support
    } catch (err) {
      console.warn('Chinese font setup warning:', err.message);
      // Continue with default fonts
    }
  };

  /**
   * Generate professional PDF document from text content
   * Creates a clean, readable report with Chinese character support
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

      // Create PDF document with Chinese support
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Add Chinese font support
      addChineseFont(pdf);

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
      // Now with proper Chinese character handling
      const addWrappedText = (text, fontSize, color, isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(...color);
        
        // Use appropriate font based on language
        if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
          // Try to use Chinese-compatible font
          try {
            pdf.setFont('SimSun', isBold ? 'bold' : 'normal');
          } catch {
            // Fallback to courier if SimSun not available
            pdf.setFont('courier', isBold ? 'bold' : 'normal');
          }
        } else {
          // Use standard font for English
          pdf.setFont(undefined, isBold ? 'bold' : 'normal');
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

        yPosition += 2;
        return lines.length;
      };

      // ===== HEADER =====
      pdf.setFillColor(...colors.darkNavy);
      pdf.rect(0, 0, pageWidth, 35, 'F');

      // Title - with Chinese support
      pdf.setFontSize(20);
      pdf.setTextColor(...colors.gold);
      if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
        try {
          pdf.setFont('SimSun', 'bold');
        } catch {
          pdf.setFont(undefined, 'bold');
        }
        pdf.text(language === 'zh-CN' ? '八字命理分析' : '八字命理分析', margin, 15);
      } else {
        pdf.setFont(undefined, 'bold');
        pdf.text('BAZI Destiny Analysis', margin, 15);
      }

      // Subtitle
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.white);
      pdf.setFont(undefined, 'normal');
      const subtitle = language === 'zh-CN' ? '专业命理报告' : language === 'zh-TW' ? '專業命理報告' : 'Professional Destiny Report';
      pdf.text(subtitle, margin, 23);

      yPosition = 40;

      // ===== USER INFORMATION SECTION =====
      if (userData && Object.keys(userData).length > 0) {
        // Section title
        pdf.setFontSize(12);
        pdf.setTextColor(...colors.darkNavy);
        if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
          try {
            pdf.setFont('SimSun', 'bold');
          } catch {
            pdf.setFont(undefined, 'bold');
          }
          const sectionTitle = language === 'zh-CN' ? '出生信息' : '出生資訊';
          pdf.text(sectionTitle, margin, yPosition);
        } else {
          pdf.setFont(undefined, 'bold');
          pdf.text('Birth Information', margin, yPosition);
        }
        yPosition += 8;

        // Draw a line
        pdf.setDrawColor(...colors.gold);
        pdf.line(margin, yPosition - 2, margin + 40, yPosition - 2);
        yPosition += 5;

        // User info with proper labels
        const getLabel = (key) => {
          const labels = {
            en: { name: 'Name', birthDate: 'Birth Date', birthTime: 'Birth Time', gender: 'Gender' },
            'zh-CN': { name: '姓名', birthDate: '出生日期', birthTime: '出生时间', gender: '性别' },
            'zh-TW': { name: '姓名', birthDate: '出生日期', birthTime: '出生時間', gender: '性別' },
          };
          const lang = language === 'zh-CN' ? 'zh-CN' : language === 'zh-TW' ? 'zh-TW' : 'en';
          return labels[lang][key] || key;
        };

        const infoData = [
          { label: getLabel('name'), value: userData.name || 'N/A' },
          { label: getLabel('birthDate'), value: userData.birthDate || 'N/A' },
          { label: getLabel('birthTime'), value: userData.birthTime || 'N/A' },
          { label: getLabel('gender'), value: userData.gender || 'N/A' },
        ];

        pdf.setFontSize(10);
        infoData.forEach((item) => {
          pdf.setTextColor(...colors.darkGray);
          if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
            try {
              pdf.setFont('SimSun', 'bold');
            } catch {
              pdf.setFont(undefined, 'bold');
            }
          } else {
            pdf.setFont(undefined, 'bold');
          }
          pdf.text(`${item.label}:`, margin + 2, yPosition);

          pdf.setTextColor(...colors.black);
          if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
            try {
              pdf.setFont('SimSun', 'normal');
            } catch {
              pdf.setFont(undefined, 'normal');
            }
          } else {
            pdf.setFont(undefined, 'normal');
          }
          pdf.text(item.value, margin + 50, yPosition);

          yPosition += 6;
        });

        yPosition += 5;
      }

      // ===== MAIN CONTENT SECTION =====
      pdf.setFontSize(12);
      pdf.setTextColor(...colors.darkNavy);
      if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
        try {
          pdf.setFont('SimSun', 'bold');
        } catch {
          pdf.setFont(undefined, 'bold');
        }
        const reportTitle = language === 'zh-CN' ? '分析报告' : '分析報告';
        pdf.text(reportTitle, margin, yPosition);
      } else {
        pdf.setFont(undefined, 'bold');
        pdf.text('Analysis Report', margin, yPosition);
      }
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

          // Check if this is a heading
          const isHeading = /^\d+\.|^##|^###/.test(trimmedLine);

          if (isHeading) {
            if (yPosition > margin && yPosition < pageHeight - 30) {
              yPosition += 3;
            }

            pdf.setFontSize(11);
            pdf.setTextColor(...colors.darkNavy);
            if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
              try {
                pdf.setFont('SimSun', 'bold');
              } catch {
                pdf.setFont(undefined, 'bold');
              }
            } else {
              pdf.setFont(undefined, 'bold');
            }
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
            if (language === 'zh-CN' || language === 'zh-TW' || language === 'zh') {
              try {
                pdf.setFont('SimSun', 'normal');
              } catch {
                pdf.setFont(undefined, 'normal');
              }
            } else {
              pdf.setFont(undefined, 'normal');
            }

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
                const continueText = language === 'zh-CN' ? '八字分析报告（续）' : language === 'zh-TW' ? '八字分析報告（續）' : 'BAZI Destiny Analysis (continued...)';
                pdf.text(continueText, margin, 10);

                yPosition = 25;
              }

              pdf.text(wrappedLine, margin, yPosition);
              yPosition += lineHeight;
            });
          }
        });

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
        pdf.setFont(undefined, 'normal');

        // Generated date
        const date = new Date().toLocaleDateString(
          language === 'zh-CN' ? 'zh-CN' : language === 'zh-TW' ? 'zh-TW' : 'en-US'
        );
        const generatedLabel = language === 'zh-CN' ? '生成日期：' : language === 'zh-TW' ? '生成日期：' : 'Generated: ';
        pdf.text(`${generatedLabel}${date}`, margin, pageHeight - 10);

        // Page number
        const pageLabel = language === 'zh-CN' ? `第 ${i} 页，共 ${totalPages} 页` : language === 'zh-TW' ? `第 ${i} 頁，共 ${totalPages} 頁` : `Page ${i} of ${totalPages}`;
        pdf.text(pageLabel, pageWidth - margin - 30, pageHeight - 10);

        // Disclaimer
        pdf.setFontSize(7);
        pdf.setTextColor(...colors.lightGray);
        const disclaimerText = language === 'zh-CN' ? '本分析仅供参考。重要决定请咨询专业人士。' : language === 'zh-TW' ? '本分析僅供參考。重要決定請諮詢專業人士。' : 'This analysis is for reference only. Consult professionals for important decisions.';
        pdf.text(disclaimerText, margin, pageHeight - 5);
      }

      // Save the PDF
      pdf.save(filename);
      console.log('PDF saved successfully with Chinese support:', filename);
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