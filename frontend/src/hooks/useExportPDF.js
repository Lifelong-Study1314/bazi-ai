/**
 * Custom hook for PDF export functionality
 */

export const useExportPDF = () => {
  const generatePDF = async (
    content,
    filename = 'BAZI_Analysis.pdf',
    userInfo = {}
  ) => {
    // Check if html2pdf is available globally
    if (typeof window === 'undefined' || !window.html2pdf) {
      console.error('html2pdf library not loaded');
      alert('PDF export library not loaded. Please refresh and try again.');
      return false;
    }

    try {
      const element = document.getElementById('pdf-content');
      if (!element) {
        alert('Content not found for PDF export');
        return false;
      }

      const html2pdf = window.html2pdf;

      const options = {
        margin: [10, 10, 10, 10], // mm margins
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { 
          orientation: 'portrait', 
          unit: 'mm', 
          format: 'a4',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf.default.set(options).from(element).save();
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
      return false;
    }
  };

  return { generatePDF };
};