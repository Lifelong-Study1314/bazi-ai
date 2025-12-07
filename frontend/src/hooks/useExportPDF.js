/**
 * Custom hook for PDF export functionality
 * Uses jsPDF with unicode font support
 */

export const useExportPDF = () => {
  const loadScript = async (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const generatePDF = async (
    content,
    filename = 'BAZI_Analysis.pdf',
    userInfo = {},
    baziData = {}
  ) => {
    try {
      // Load jsPDF
      if (!window.jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Set font to a unicode-compatible font
      // Using standard fonts that work better with jsPDF
      pdf.setFont('helvetica');

      // Helper function to add text with wrapping
      const addText = (text, fontSize = 11, isBold = false, color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        // Split text into lines
        const lines = pdf.splitTextToSize(String(text), contentWidth);
        const lineHeight = fontSize * 0.35;
        
        lines.forEach((line, index) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight + 1;
        });
      };

      // Helper function for spacing
      const addSpacing = (height = 5) => {
        yPosition += height;
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Helper function to draw a line
      const drawLine = (color = [201, 169, 97]) => {
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 4;
      };

      // ===== HEADER =====
      pdf.setFontSize(18);
      pdf.setTextColor(201, 169, 97);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BAZI Destiny Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Professional BAZI Chart Analysis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Draw separator line
      drawLine([201, 169, 97]);
      addSpacing(2);

      // ===== PERSONAL INFORMATION =====
      addText('PERSONAL INFORMATION', 12, true, [201, 169, 97]);
      addSpacing(3);

      addText(`Name: ${userInfo.name || 'N/A'}`, 10, false, [51, 51, 51]);
      addText(`Birth Date: ${userInfo.birthDate || 'N/A'}`, 10, false, [51, 51, 51]);
      addText(`Birth Time: ${userInfo.birthTime || 'N/A'}`, 10, false, [51, 51, 51]);
      addText(`Gender: ${userInfo.gender || 'N/A'}`, 10, false, [51, 51, 51]);

      addSpacing(8);

      // ===== FOUR PILLARS =====
      addText('FOUR PILLARS (Si Zhu)', 12, true, [201, 169, 97]);
      addSpacing(3);

      if (baziData.four_pillars) {
        const pillars = [
          { label: 'Year:', key: 'year' },
          { label: 'Month:', key: 'month' },
          { label: 'Day:', key: 'day' },
          { label: 'Hour:', key: 'hour' }
        ];

        pillars.forEach(({ label, key }) => {
          const pillar = baziData.four_pillars[key];
          if (pillar) {
            const stemName = pillar.stem?.name_cn || pillar.stem?.name || '';
            const branchName = pillar.branch?.name_cn || pillar.branch?.name || '';
            const element = pillar.stem?.element || '';
            const text = `${label} ${stemName} ${branchName} (${element})`;
            addText(text, 10, false, [51, 51, 51]);
          }
        });
      }

      addSpacing(8);

      // ===== DAY MASTER =====
      addText('DAY MASTER (Ri Zhu)', 12, true, [201, 169, 97]);
      addSpacing(3);

      const dayMasterStem = baziData.day_master?.stem_cn || baziData.day_master?.stem || 'N/A';
      const dayMasterElement = baziData.day_master?.element || 'N/A';
      const dayMasterYinYang = baziData.day_master?.yin_yang || 'N/A';
      
      addText(`${dayMasterStem} (${dayMasterElement}, ${dayMasterYinYang})`, 11, true, [201, 169, 97]);

      addSpacing(8);

      // ===== FIVE ELEMENTS =====
      addText('FIVE ELEMENTS ANALYSIS (Wu Xing)', 12, true, [201, 169, 97]);
      addSpacing(3);

      if (baziData.elements?.counts) {
        let elementStr = 'Elements: ';
        Object.entries(baziData.elements.counts).forEach(([elem, count]) => {
          elementStr += `${elem}(${count}) `;
        });
        addText(elementStr, 10, false, [51, 51, 51]);
      }

      if (baziData.elements?.analysis?.balance) {
        addText(`Balance Status: ${baziData.elements.analysis.balance}`, 10, false, [51, 51, 51]);
      }

      addSpacing(8);

      // ===== DETAILED ANALYSIS =====
      if (content && content.trim().length > 0) {
        addText('DETAILED ANALYSIS', 12, true, [201, 169, 97]);
        addSpacing(3);

        // Parse and format the insights
        const lines = content.split('\n');
        
        lines.forEach(line => {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('###')) {
            // Section title - extract just the text after ###
            const match = trimmed.match(/###\s+\d+\.?\s+(.+)/);
            if (match) {
              addSpacing(3);
              addText(match[1].trim(), 11, true, [51, 51, 51]);
              addSpacing(2);
            }
          } else if (trimmed && !trimmed.startsWith('###')) {
            // Content - just regular text
            if (trimmed.length > 0) {
              addText(trimmed, 9, false, [68, 68, 68]);
              addSpacing(1);
            }
          }
        });
      }

      addSpacing(5);

      // ===== FOOTER =====
      yPosition = pageHeight - margin - 12;
      pdf.setDrawColor(201, 169, 97);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;

      pdf.setFontSize(8);
      pdf.setTextColor(153, 153, 153);
      pdf.setFont('helvetica', 'normal');
      const timestamp = new Date().toLocaleString();
      pdf.text(`Generated on: ${timestamp}`, margin, yPosition);
      yPosition += 3;
      pdf.text('This report is generated by AI-powered BAZI analysis system for reference only.', margin, yPosition);

      // Save the PDF
      pdf.save(filename);
      console.log('PDF generated successfully');
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`Error generating PDF: ${error.message}`);
      return false;
    }
  };

  return { generatePDF };
};