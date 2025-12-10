import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFService {
  generateInvoice(invoice, patient, settings) {
    const doc = new jsPDF();
    
    // Logo (if available)
    try {
      const logoPath = '/assets/logo.png';
      // Note: In production, logo will be embedded as base64 or loaded from public folder
      // doc.addImage(logoPath, 'PNG', 15, 10, 30, 30);
    } catch (e) {
      console.log('Logo not found, skipping');
    }
    
    // Header
    doc.setFontSize(20);
    doc.text(settings.clinicName || 'Abdullah Dental Care', 20, 20);
    doc.setFontSize(10);
    doc.text(settings.clinicAddress || 'Hayatabad, Peshawar', 20, 28);
    doc.text(settings.clinicPhone || '+92-334-5822-622', 20, 34);
    if (settings.doctorEmail) {
      doc.text(settings.doctorEmail, 20, 40);
    }
    
    // Invoice info
    doc.setFontSize(16);
    doc.text('INVOICE', 150, 20);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 28);
    doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 150, 34);
    doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 150, 40);
    
    // Patient info
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 55);
    doc.setFontSize(10);
    doc.text(patient.name, 20, 63);
    doc.text(patient.mobileNumber, 20, 69);
    
    // Items table
    const items = invoice.items.map(item => [
      item.name,
      item.toothNumber || '-',
      item.quantity,
      `$${item.priceUSD.toFixed(2)}`,
      `Rs. ${item.pricePKR.toLocaleString()}`
    ]);
    
    doc.autoTable({
      startY: 80,
      head: [['Treatment', 'Tooth', 'Qty', 'USD', 'PKR']],
      body: items,
      theme: 'grid'
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)} / Rs. ${Math.round(invoice.subtotal * invoice.exchangeRate).toLocaleString()}`, 120, finalY);
    doc.text(`Discount: ${invoice.discount}%`, 120, finalY + 6);
    doc.setFontSize(12);
    doc.text(`TOTAL: $${invoice.total.toFixed(2)} / Rs. ${invoice.totalPKR.toLocaleString()}`, 120, finalY + 14);
    doc.setFontSize(10);
    doc.text(`Exchange Rate: $1 = Rs. ${invoice.exchangeRate}`, 120, finalY + 22);
    
    // Footer
    const doctorInfo = `${settings.doctorName || 'Dr. Ahmed Abdullah Khan'}${settings.doctorQualification ? ', ' + settings.doctorQualification : ''} - PMC: ${settings.doctorPMC || '7071-D'}`;
    doc.text(doctorInfo, 20, 280);
    
    return doc;
  }

  generatePrescription(prescription, patient, settings) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(settings.clinicName || 'Abdullah Dental Care', 20, 20);
    doc.setFontSize(10);
    doc.text(settings.clinicAddress || 'Hayatabad, Peshawar', 20, 28);
    doc.text(settings.clinicPhone || '+92-334-5822-622', 20, 34);
    if (settings.doctorEmail) {
      doc.text(settings.doctorEmail, 20, 40);
    }
    
    // Rx symbol
    doc.setFontSize(30);
    doc.text('Rx', 180, 25);
    
    // Patient info
    doc.setFontSize(12);
    doc.text('Patient Information', 20, 55);
    doc.setFontSize(10);
    doc.text(`Name: ${patient.name}`, 20, 63);
    doc.text(`Age: ${patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / 31557600000) : 'N/A'}`, 20, 69);
    doc.text(`Date: ${new Date(prescription.prescribedDate).toLocaleDateString()}`, 20, 75);
    
    // Medications
    doc.setFontSize(12);
    doc.text('Medications:', 20, 90);
    doc.setFontSize(11);
    const medications = prescription.medications.split('\n');
    let y = 98;
    medications.forEach(med => {
      doc.text(med, 25, y);
      y += 7;
    });
    
    // Instructions
    if (prescription.instructions) {
      y += 5;
      doc.setFontSize(12);
      doc.text('Instructions:', 20, y);
      doc.setFontSize(10);
      y += 8;
      const instructions = prescription.instructions.split('\n');
      instructions.forEach(inst => {
        doc.text(inst, 25, y);
        y += 6;
      });
    }
    
    // Signature
    doc.setFontSize(10);
    doc.text('_________________________', 130, 260);
    const doctorInfo = `${prescription.prescribedBy || settings.doctorName || 'Dr. Ahmed Abdullah Khan'}`;
    doc.text(doctorInfo, 130, 268);
    const qualAndPMC = `${settings.doctorQualification || 'BDS, MPH'} - PMC: ${settings.doctorPMC || '7071-D'}`;
    doc.text(qualAndPMC, 130, 274);
    
    return doc;
  }

  downloadPDF(doc, filename) {
    doc.save(filename);
  }

  async sharePDF(doc, filename) {
    if (navigator.share && navigator.canShare) {
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: filename,
          });
          return true;
        } catch (err) {
          console.error('Share failed:', err);
          return false;
        }
      }
    }
    return false;
  }
}

export const pdfService = new PDFService();
