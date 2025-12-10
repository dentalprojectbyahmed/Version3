// Web Share API utility for WhatsApp and other sharing

export const shareService = {
  // Check if Web Share API is available
  isSupported() {
    return navigator.share !== undefined;
  },

  // Share text message
  async shareText(title, text) {
    if (!this.isSupported()) {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Message copied to clipboard! Paste it in WhatsApp.');
      return false;
    }

    try {
      await navigator.share({
        title,
        text
      });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  },

  // Share file (PDF)
  async shareFile(title, text, file) {
    if (!this.isSupported()) {
      // Fallback: Download file
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      alert('File downloaded! You can manually share it via WhatsApp.');
      return false;
    }

    try {
      // Check if files can be shared
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text,
          files: [file]
        });
        return true;
      } else {
        // Fallback to download
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        return false;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  },

  // Share appointment details
  async shareAppointment(appointment, patient) {
    const text = `🦷 *ABDULLAH DENTAL CARE*
📅 Appointment Reminder

👤 Patient: ${patient.name}
📱 Phone: ${patient.mobileNumber}
📆 Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}
🕐 Time: ${appointment.appointmentTime}
📝 Reason: ${appointment.reason}
🏥 Type: ${appointment.calendarType}

📍 37-G4, Qasim Ave., Phase 2, Hayatabad, Peshawar
📞 +92-334-5822-622

Please arrive 10 minutes early.`;

    return await this.shareText('Appointment Reminder', text);
  },

  // Share prescription
  async sharePrescription(prescription, patient, pdfBlob) {
    const text = `🦷 *ABDULLAH DENTAL CARE*
💊 Prescription

👤 Patient: ${patient.name}
📅 Date: ${new Date(prescription.prescribedDate).toLocaleDateString()}
👨‍⚕️ Dr. Ahmed Abdullah Khan

Please follow the prescription as directed.

📍 37-G4, Qasim Ave., Phase 2, Hayatabad, Peshawar
📞 +92-334-5822-622`;

    if (pdfBlob) {
      const file = new File([pdfBlob], `Prescription-${patient.name}.pdf`, { type: 'application/pdf' });
      return await this.shareFile('Prescription', text, file);
    } else {
      return await this.shareText('Prescription', text);
    }
  },

  // Share invoice
  async shareInvoice(invoice, patient, pdfBlob) {
    const text = `🦷 *ABDULLAH DENTAL CARE*
🧾 Invoice #${invoice.invoiceNumber}

👤 Patient: ${patient.name}
📅 Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}
💰 Amount: Rs. ${invoice.totalPKR.toLocaleString()}
📊 Status: ${invoice.paymentStatus.toUpperCase()}

Thank you for choosing Abdullah Dental Care!

📍 37-G4, Qasim Ave., Phase 2, Hayatabad, Peshawar
📞 +92-334-5822-622`;

    if (pdfBlob) {
      const file = new File([pdfBlob], `Invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
      return await this.shareFile('Invoice', text, file);
    } else {
      return await this.shareText('Invoice', text);
    }
  },

  // Share treatment plan
  async shareTreatmentPlan(patient, treatments, totalCost) {
    const treatmentList = treatments.map((t, i) => `${i + 1}. ${t.name} - Rs. ${t.priceUSD * 278}`).join('\n');
    
    const text = `🦷 *ABDULLAH DENTAL CARE*
📋 Treatment Plan

👤 Patient: ${patient.name}
📅 Date: ${new Date().toLocaleDateString()}

*Recommended Treatments:*
${treatmentList}

💰 *Total Estimated Cost:* Rs. ${totalCost.toLocaleString()}

👨‍⚕️ Dr. Ahmed Abdullah Khan
BDS, MPH

📍 37-G4, Qasim Ave., Phase 2, Hayatabad, Peshawar
📞 +92-334-5822-622`;

    return await this.shareText('Treatment Plan', text);
  },

  // Share appointment reminder (bulk)
  async shareReminder(appointments) {
    const reminderText = appointments.map(apt => 
      `• ${apt.patient.name} - ${new Date(apt.appointmentDate).toLocaleDateString()} at ${apt.appointmentTime}`
    ).join('\n');

    const text = `🦷 *ABDULLAH DENTAL CARE*
📅 Today's Appointments

${reminderText}

Have a great day!

📍 37-G4, Qasim Ave., Phase 2, Hayatabad, Peshawar
📞 +92-334-5822-622`;

    return await this.shareText('Today\'s Appointments', text);
  }
};
