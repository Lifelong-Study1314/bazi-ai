/**
 * Custom hook for PDF export functionality
 * Uses jsPDF + html2canvas for better compatibility
 */

export const useExportPDF = () => {
  const loadScripts = async () => {
    return new Promise((resolve) => {
      // Load html2canvas
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script1.onload = () => {
        // Load jsPDF
        const script2 = document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script2.onload = () => {
          resolve();
        };
        document.head.appendChild(script2);
      };
      document.head.appendChild(script1);
    });
  };

  const generatePDF = async (
    content,
    filename = 'BAZI_Analysis.pdf',
    userInfo = {}
  ) => {
    try {
      // Load required libraries if not already loaded
      if (!window.html2canvas || !window.jspdf) {
        await loadScripts();
      }

      const element = document.getElementById('pdf-content');
      if (!element) {
        alert('Content not found for PDF export');
        return false;
      }

      // Show the hidden PDF template
      element.style.display = 'block';

      const { html2canvas } = window;
      const { jsPDF } = window.jspdf;

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Hide the template again
      element.style.display = 'none';

      // Create PDF from canvas
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again. Check console for details.');
      return false;
    }
  };

  return { generatePDF };
};