/**
 * Custom hook for PDF export functionality
 * Uses jsPDF to generate PDF directly from data
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
      // Load jsPDF only (we'll create content directly, not capture)
      if (!window.jspdf) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with wrapping
      const addText = (text, fontSize = 11, fontWeight = 'normal', color = [0, 0, 0]) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        if (fontWeight === 'bold') {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, margin, yPosition);
        yPosition += (lines.length * fontSize * 0.35) + 2;

        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Helper function for lines/spacing
      const addSpacing = (height = 5) => {
        yPosition += height;
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // ===== HEADER =====
      pdf.setDrawColor(201, 169, 97);
      pdf.setLineWidth(1);
      
      addText('八字命盤分析報告', 18, 'bold', [201, 169, 97]);
      addText('BAZI Destiny Analysis Report', 10, 'normal', [102, 102, 102]);
      
      // Draw line
      yPosition += 2;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      // ===== PERSONAL INFORMATION =====
      addText('📋 Personal Information', 12, 'bold', [201, 169, 97]);
      addSpacing(3);

      const personalInfo = [
        ['Name:', userInfo.name || 'N/A'],
        ['Birth Date:', userInfo.birthDate || 'N/A'],
        ['Birth Time:', userInfo.birthTime || 'N/A'],
        ['Gender:', userInfo.gender || 'N/A']
      ];

      personalInfo.forEach(([label, value]) => {
        addText(`${label} ${value}`, 10, 'normal', [51, 51, 51]);
      });

      addSpacing(8);

      // ===== FOUR PILLARS =====
      addText('☯️ Four Pillars (四柱八字)', 12, 'bold', [201, 169, 97]);
      addSpacing(3);

      if (baziData.four_pillars) {
        const pillars = [
          { name: 'Year:', key: 'year' },
          { name: 'Month:', key: 'month' },
          { name: 'Day:', key: 'day' },
          { name: 'Hour:', key: 'hour' }
        ];

        pillars.forEach(({ name, key }) => {
          const pillar = baziData.four_pillars[key];
          if (pillar) {
            const text = `${name} ${pillar.stem?.name_cn || ''}${pillar.branch?.name_cn || ''} (${pillar.stem?.element || ''})`;
            addText(text, 10, 'normal', [51, 51, 51]);
          }
        });
      }

      addSpacing(8);

      // ===== DAY MASTER =====
      addText('🎯 Day Master (日主)', 12, 'bold', [201, 169, 97]);
      addSpacing(3);

      const dayMasterText = `${baziData.day_master?.stem_cn || 'N/A'} - ${baziData.day_master?.element || 'N/A'} (${baziData.day_master?.yin_yang || 'N/A'})`;
      addText(dayMasterText, 11, 'bold', [201, 169, 97]);

      addSpacing(8);

      // ===== FIVE ELEMENTS =====
      addText('🔥 Five Elements Analysis (五行分析)', 12, 'bold', [201, 169, 97]);
      addSpacing(3);

      if (baziData.elements?.counts) {
        let elementText = 'Elements: ';
        Object.entries(baziData.elements.counts).forEach(([elem, count]) => {
          elementText += `${elem}(${count}) `;
        });
        addText(elementText, 10, 'normal', [51, 51, 51]);
      }

      if (baziData.elements?.analysis?.balance) {
        addText(`Balance Status: ${baziData.elements.analysis.balance}`, 10, 'normal', [51, 51, 51]);
      }

      addSpacing(8);

      // ===== DETAILED ANALYSIS =====
      if (content) {
        addText('📊 Detailed Analysis', 12, 'bold', [201, 169, 97]);
        addSpacing(3);

        // Parse insights
        const lines = content.split('\n');
        let inSection = false;

        lines.forEach(line => {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('###')) {
            // Section title
            const match = trimmed.match(/###\s+\d+\.?\s+(.+)/);
            if (match) {
              addSpacing(3);
              addText(match[1], 11, 'bold', [51, 51, 51]);
              addSpacing(2);
              inSection = true;
            }
          } else if (trimmed && inSection) {
            // Content
            addText(trimmed, 9, 'normal', [68, 68, 68]);
            addSpacing(1);
          }
        });
      }

      addSpacing(10);

      // ===== FOOTER =====
      pdf.setDrawColor(201, 169, 97);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      pdf.setFontSize(8);
      pdf.setTextColor(153, 153, 153);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 5;
      pdf.text('This report is generated by an AI-powered BAZI analysis system for reference only.', margin, yPosition);

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