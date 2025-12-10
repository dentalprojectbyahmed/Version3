import Dexie from 'dexie';

// IndexedDB Schema for Abdullah Dental Care
export class AbdullahDentalDB extends Dexie {
  constructor() {
    super('AbdullahDentalCare');
    
    this.version(1).stores({
      // Patients
      patients: '++id, mobileNumber, name, cnic, email, dateOfBirth, gender, address, behaviorTags, medicalAlerts, allergies, medicalConditions, currentMedications, emergencyContact, emergencyPhone, registrationDate, lastVisit',
      
      // Appointments
      appointments: '++id, patientId, appointmentDate, timeSlot, status, treatmentType, duration, notes, calendarType, dentistId, appointmentColor, createdAt',
      
      // Treatments (Catalog)
      treatmentCatalog: '++id, code, category, name, description, priceUSD, pricePKR, fdiNotation',
      
      // Treatment Records
      treatmentRecords: '++id, patientId, appointmentId, treatmentId, toothNumber, fdiNotation, status, dateCompleted, notes',
      
      // Prescriptions
      prescriptions: '++id, patientId, appointmentId, medications, instructions, prescribedDate, prescribedBy',
      
      // Billing & Invoices
      invoices: '++id, patientId, invoiceNumber, invoiceDate, items, subtotal, discount, tax, total, totalPKR, exchangeRate, paymentStatus, paymentMethod, paidAmount, dueAmount',
      
      // Lab Work
      labWork: '++id, patientId, labName, workType, description, sentDate, expectedDate, receivedDate, cost, status, notes',
      
      // Inventory
      inventory: '++id, itemName, category, quantity, unit, reorderLevel, supplier, costPerUnit, lastRestocked, expiryDate',
      
      // Expenses
      expenses: '++id, category, description, amount, date, paymentMethod, vendor, notes, receiptImage',
      
      // Settings
      settings: 'key, value',
      
      // Sync Queue (for Google Sheets)
      syncQueue: '++id, tableName, operation, data, timestamp, synced',
      
      // Activity Log (for audit trail)
      activityLog: '++id, userId, action, details, timestamp',
    });
  }
}

// Initialize database
export const db = new AbdullahDentalDB();

// Default treatment catalog (70 items)
export const defaultTreatments = [
  // Preventive & Diagnostic (FDI: All teeth)
  { code: 'P001', category: 'Preventive', name: 'Oral Examination', description: 'Complete oral examination', priceUSD: 10, fdiNotation: 'All' },
  { code: 'P002', category: 'Preventive', name: 'Scaling (Full Mouth)', description: 'Complete oral prophylaxis', priceUSD: 25, fdiNotation: 'All' },
  { code: 'P003', category: 'Preventive', name: 'Scaling (Per Quadrant)', description: 'Scaling per quadrant', priceUSD: 8, fdiNotation: 'Quadrant' },
  { code: 'P004', category: 'Preventive', name: 'Polishing', description: 'Teeth polishing', priceUSD: 10, fdiNotation: 'All' },
  { code: 'P005', category: 'Preventive', name: 'Fluoride Application', description: 'Topical fluoride treatment', priceUSD: 15, fdiNotation: 'All' },
  
  // Restorative (FDI: Specific tooth)
  { code: 'R001', category: 'Restorative', name: 'Composite Filling (Small)', description: 'Small cavity filling', priceUSD: 30, fdiNotation: 'Single' },
  { code: 'R002', category: 'Restorative', name: 'Composite Filling (Medium)', description: 'Medium cavity filling', priceUSD: 40, fdiNotation: 'Single' },
  { code: 'R003', category: 'Restorative', name: 'Composite Filling (Large)', description: 'Large cavity filling', priceUSD: 50, fdiNotation: 'Single' },
  { code: 'R004', category: 'Restorative', name: 'Amalgam Filling', description: 'Silver filling', priceUSD: 25, fdiNotation: 'Single' },
  { code: 'R005', category: 'Restorative', name: 'Glass Ionomer Filling', description: 'GIC restoration', priceUSD: 20, fdiNotation: 'Single' },
  
  // Endodontics (FDI: Specific tooth)
  { code: 'E001', category: 'Endodontics', name: 'RCT - Anterior', description: 'Root canal - anterior tooth', priceUSD: 80, fdiNotation: 'Single' },
  { code: 'E002', category: 'Endodontics', name: 'RCT - Premolar', description: 'Root canal - premolar', priceUSD: 100, fdiNotation: 'Single' },
  { code: 'E003', category: 'Endodontics', name: 'RCT - Molar (Single Canal)', description: 'Root canal - molar 1 canal', priceUSD: 120, fdiNotation: 'Single' },
  { code: 'E004', category: 'Endodontics', name: 'RCT - Molar (2 Canals)', description: 'Root canal - molar 2 canals', priceUSD: 150, fdiNotation: 'Single' },
  { code: 'E005', category: 'Endodontics', name: 'RCT - Molar (3 Canals)', description: 'Root canal - molar 3 canals', priceUSD: 180, fdiNotation: 'Single' },
  { code: 'E006', category: 'Endodontics', name: 'Pulpotomy', description: 'Pulp capping procedure', priceUSD: 40, fdiNotation: 'Single' },
  { code: 'E007', category: 'Endodontics', name: 'Pulpectomy', description: 'Pulp removal', priceUSD: 50, fdiNotation: 'Single' },
  
  // Prosthodontics (FDI: Specific tooth/teeth)
  { code: 'PR001', category: 'Prosthodontics', name: 'Crown - Metal', description: 'Metal crown', priceUSD: 80, fdiNotation: 'Single' },
  { code: 'PR002', category: 'Prosthodontics', name: 'Crown - PFM', description: 'Porcelain fused to metal', priceUSD: 120, fdiNotation: 'Single' },
  { code: 'PR003', category: 'Prosthodontics', name: 'Crown - Zirconia', description: 'Zirconia crown', priceUSD: 150, fdiNotation: 'Single' },
  { code: 'PR004', category: 'Prosthodontics', name: 'Crown - E-Max', description: 'E-Max aesthetic crown', priceUSD: 180, fdiNotation: 'Single' },
  { code: 'PR005', category: 'Prosthodontics', name: 'Bridge - 3 Unit (PFM)', description: '3 unit PFM bridge', priceUSD: 300, fdiNotation: 'Multiple' },
  { code: 'PR006', category: 'Prosthodontics', name: 'Bridge - 3 Unit (Zirconia)', description: '3 unit zirconia bridge', priceUSD: 400, fdiNotation: 'Multiple' },
  { code: 'PR007', category: 'Prosthodontics', name: 'Complete Denture (Upper)', description: 'Full upper denture', priceUSD: 250, fdiNotation: 'Arch' },
  { code: 'PR008', category: 'Prosthodontics', name: 'Complete Denture (Lower)', description: 'Full lower denture', priceUSD: 250, fdiNotation: 'Arch' },
  { code: 'PR009', category: 'Prosthodontics', name: 'Partial Denture (Acrylic)', description: 'Removable partial denture', priceUSD: 150, fdiNotation: 'Multiple' },
  { code: 'PR010', category: 'Prosthodontics', name: 'Partial Denture (Cast)', description: 'Cast partial denture', priceUSD: 300, fdiNotation: 'Multiple' },
  { code: 'PR011', category: 'Prosthodontics', name: 'Veneer (Composite)', description: 'Composite veneer', priceUSD: 80, fdiNotation: 'Single' },
  { code: 'PR012', category: 'Prosthodontics', name: 'Veneer (Porcelain)', description: 'Porcelain veneer', priceUSD: 200, fdiNotation: 'Single' },
  
  // Surgery & Extraction (FDI: Specific tooth)
  { code: 'S001', category: 'Surgery', name: 'Simple Extraction', description: 'Simple tooth extraction', priceUSD: 20, fdiNotation: 'Single' },
  { code: 'S002', category: 'Surgery', name: 'Surgical Extraction', description: 'Surgical tooth removal', priceUSD: 40, fdiNotation: 'Single' },
  { code: 'S003', category: 'Surgery', name: 'Impacted Tooth Extraction', description: 'Impacted tooth removal', priceUSD: 80, fdiNotation: 'Single' },
  { code: 'S004', category: 'Surgery', name: 'Wisdom Tooth Extraction', description: 'Third molar removal', priceUSD: 60, fdiNotation: 'Single' },
  { code: 'S005', category: 'Surgery', name: 'Alveoloplasty', description: 'Bone recontouring', priceUSD: 50, fdiNotation: 'Area' },
  { code: 'S006', category: 'Surgery', name: 'Incision & Drainage', description: 'Abscess drainage', priceUSD: 30, fdiNotation: 'Area' },
  { code: 'S007', category: 'Surgery', name: 'Frenectomy', description: 'Frenum removal', priceUSD: 40, fdiNotation: 'Area' },
  { code: 'S008', category: 'Surgery', name: 'Operculectomy', description: 'Gum flap removal', priceUSD: 35, fdiNotation: 'Single' },
  
  // Orthodontics
  { code: 'O001', category: 'Orthodontics', name: 'Metal Braces (Full)', description: 'Complete metal braces', priceUSD: 800, fdiNotation: 'Both Arches' },
  { code: 'O002', category: 'Orthodontics', name: 'Ceramic Braces (Full)', description: 'Complete ceramic braces', priceUSD: 1200, fdiNotation: 'Both Arches' },
  { code: 'O003', category: 'Orthodontics', name: 'Retainer (Removable)', description: 'Orthodontic retainer', priceUSD: 100, fdiNotation: 'Per Arch' },
  { code: 'O004', category: 'Orthodontics', name: 'Retainer (Fixed)', description: 'Bonded retainer', priceUSD: 120, fdiNotation: 'Per Arch' },
  { code: 'O005', category: 'Orthodontics', name: 'Orthodontic Adjustment', description: 'Monthly adjustment', priceUSD: 30, fdiNotation: 'Visit' },
  
  // Periodontics
  { code: 'PE001', category: 'Periodontics', name: 'Deep Scaling (Per Quadrant)', description: 'Subgingival scaling', priceUSD: 40, fdiNotation: 'Quadrant' },
  { code: 'PE002', category: 'Periodontics', name: 'Root Planning', description: 'Root surface debridement', priceUSD: 50, fdiNotation: 'Quadrant' },
  { code: 'PE003', category: 'Periodontics', name: 'Gingivectomy', description: 'Gum tissue removal', priceUSD: 60, fdiNotation: 'Per Tooth' },
  { code: 'PE004', category: 'Periodontics', name: 'Flap Surgery', description: 'Periodontal flap procedure', priceUSD: 150, fdiNotation: 'Per Quadrant' },
  { code: 'PE005', category: 'Periodontics', name: 'Gum Grafting', description: 'Soft tissue graft', priceUSD: 200, fdiNotation: 'Per Site' },
  
  // Pediatric Dentistry (FDI: Primary teeth 51-85)
  { code: 'PD001', category: 'Pediatric', name: 'Primary Tooth Extraction', description: 'Baby tooth removal', priceUSD: 15, fdiNotation: 'Single' },
  { code: 'PD002', category: 'Pediatric', name: 'Stainless Steel Crown', description: 'Pediatric crown', priceUSD: 40, fdiNotation: 'Single' },
  { code: 'PD003', category: 'Pediatric', name: 'Space Maintainer', description: 'Orthodontic space keeper', priceUSD: 80, fdiNotation: 'Device' },
  { code: 'PD004', category: 'Pediatric', name: 'Pit & Fissure Sealant', description: 'Protective sealant', priceUSD: 15, fdiNotation: 'Per Tooth' },
  { code: 'PD005', category: 'Pediatric', name: 'Fluoride Varnish', description: 'Pediatric fluoride', priceUSD: 12, fdiNotation: 'Application' },
  
  // Cosmetic
  { code: 'C001', category: 'Cosmetic', name: 'Teeth Whitening (In-Office)', description: 'Professional whitening', priceUSD: 150, fdiNotation: 'Both Arches' },
  { code: 'C002', category: 'Cosmetic', name: 'Teeth Whitening (Take-Home)', description: 'Home whitening kit', priceUSD: 100, fdiNotation: 'Kit' },
  { code: 'C003', category: 'Cosmetic', name: 'Smile Design Consultation', description: 'Aesthetic planning', priceUSD: 50, fdiNotation: 'Consultation' },
  { code: 'C004', category: 'Cosmetic', name: 'Tooth Contouring', description: 'Enamel reshaping', priceUSD: 30, fdiNotation: 'Per Tooth' },
  { code: 'C005', category: 'Cosmetic', name: 'Gum Contouring', description: 'Gingival reshaping', priceUSD: 100, fdiNotation: 'Per Arch' },
  
  // Implants
  { code: 'I001', category: 'Implants', name: 'Dental Implant (Fixture)', description: 'Implant placement', priceUSD: 500, fdiNotation: 'Single' },
  { code: 'I002', category: 'Implants', name: 'Implant Abutment', description: 'Implant connector', priceUSD: 150, fdiNotation: 'Single' },
  { code: 'I003', category: 'Implants', name: 'Implant Crown (PFM)', description: 'Implant crown PFM', priceUSD: 200, fdiNotation: 'Single' },
  { code: 'I004', category: 'Implants', name: 'Implant Crown (Zirconia)', description: 'Implant crown zirconia', priceUSD: 250, fdiNotation: 'Single' },
  { code: 'I005', category: 'Implants', name: 'Bone Grafting', description: 'Bone augmentation', priceUSD: 300, fdiNotation: 'Per Site' },
  { code: 'I006', category: 'Implants', name: 'Sinus Lift', description: 'Maxillary sinus elevation', priceUSD: 400, fdiNotation: 'Per Side' },
  
  // Emergency
  { code: 'EM001', category: 'Emergency', name: 'Emergency Consultation', description: 'Urgent examination', priceUSD: 20, fdiNotation: 'Visit' },
  { code: 'EM002', category: 'Emergency', name: 'Pain Relief Medication', description: 'Emergency pain management', priceUSD: 10, fdiNotation: 'Service' },
  { code: 'EM003', category: 'Emergency', name: 'Temporary Filling', description: 'Emergency restoration', priceUSD: 15, fdiNotation: 'Single' },
  { code: 'EM004', category: 'Emergency', name: 'Re-cementation', description: 'Crown/bridge recementation', priceUSD: 20, fdiNotation: 'Per Unit' },
];

// Initialize default data
export const initializeDefaultData = async () => {
  const count = await db.treatmentCatalog.count();
  
  if (count === 0) {
    await db.treatmentCatalog.bulkAdd(defaultTreatments);
    console.log('✅ Default treatment catalog loaded');
  }
  
  // Set default settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.bulkPut([
      { key: 'clinicName', value: 'Abdullah Dental Care' },
      { key: 'clinicAddress', value: '37-G4 Qasim Ave Phase 2, Hayatabad, Peshawar' },
      { key: 'clinicPhone', value: '+92-334-5822-622' },
      { key: 'doctorName', value: 'Dr. Ahmed Abdullah Khan' },
      { key: 'doctorPMC', value: '7071-D' },
      { key: 'doctorQualification', value: 'BDS, MPH' },
      { key: 'doctorEmail', value: 'ahmedakg@gmail.com' },
      { key: 'currency', value: 'PKR' },
      { key: 'exchangeRate', value: '278' },
      { key: 'taxRate', value: '0' },
      { key: 'syncEnabled', value: 'false' },
      { key: 'googleSheetsId', value: '' },
      { key: 'lastSync', value: '' },
    ]);
    console.log('✅ Default settings loaded');
  }
};
