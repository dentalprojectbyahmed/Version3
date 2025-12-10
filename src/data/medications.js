// Pakistani Dental Medications Database

export const medications = {
  // Antibiotics
  antibiotics: [
    {
      id: 'AB001',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      dosageForm: 'Capsule',
      strengths: ['250mg', '500mg'],
      commonDosage: '500mg TDS',
      duration: '5-7 days',
      contraindications: ['Penicillin allergy'],
      pregnancy: 'Safe',
      class: 'Penicillin'
    },
    {
      id: 'AB002',
      genericName: 'Amoxicillin + Clavulanic Acid',
      brandName: 'Augmentin',
      dosageForm: 'Tablet',
      strengths: ['625mg', '1g'],
      commonDosage: '625mg TDS',
      duration: '5-7 days',
      contraindications: ['Penicillin allergy'],
      pregnancy: 'Safe',
      class: 'Penicillin + Beta-lactamase inhibitor'
    },
    {
      id: 'AB003',
      genericName: 'Azithromycin',
      brandName: 'Zithromax / Azee',
      dosageForm: 'Tablet',
      strengths: ['250mg', '500mg'],
      commonDosage: '500mg OD',
      duration: '3 days',
      contraindications: ['Liver disease'],
      pregnancy: 'Safe',
      class: 'Macrolide'
    },
    {
      id: 'AB004',
      genericName: 'Metronidazole',
      brandName: 'Flagyl',
      dosageForm: 'Tablet',
      strengths: ['200mg', '400mg'],
      commonDosage: '400mg TDS',
      duration: '5-7 days',
      contraindications: ['Alcohol', 'First trimester pregnancy'],
      pregnancy: 'Avoid in 1st trimester',
      class: 'Nitroimidazole'
    },
    {
      id: 'AB005',
      genericName: 'Clindamycin',
      brandName: 'Dalacin C',
      dosageForm: 'Capsule',
      strengths: ['150mg', '300mg'],
      commonDosage: '300mg QDS',
      duration: '5-7 days',
      contraindications: ['Colitis history'],
      pregnancy: 'Safe',
      class: 'Lincosamide'
    },
    {
      id: 'AB006',
      genericName: 'Cephalexin',
      brandName: 'Keflex',
      dosageForm: 'Capsule',
      strengths: ['250mg', '500mg'],
      commonDosage: '500mg QDS',
      duration: '5-7 days',
      contraindications: ['Cephalosporin allergy'],
      pregnancy: 'Safe',
      class: 'Cephalosporin'
    }
  ],

  // Analgesics (Pain Relief)
  analgesics: [
    {
      id: 'AN001',
      genericName: 'Paracetamol',
      brandName: 'Panadol',
      dosageForm: 'Tablet',
      strengths: ['500mg', '665mg'],
      commonDosage: '500-1000mg TDS-QDS',
      duration: '3-5 days',
      contraindications: ['Liver disease'],
      pregnancy: 'Safe',
      class: 'Analgesic/Antipyretic'
    },
    {
      id: 'AN002',
      genericName: 'Ibuprofen',
      brandName: 'Brufen',
      dosageForm: 'Tablet',
      strengths: ['200mg', '400mg', '600mg'],
      commonDosage: '400mg TDS',
      duration: '3-5 days',
      contraindications: ['Gastric ulcer', 'Pregnancy', 'Asthma', 'Blood thinners'],
      pregnancy: 'Avoid',
      class: 'NSAID'
    },
    {
      id: 'AN003',
      genericName: 'Diclofenac Sodium',
      brandName: 'Voltaren / Voveran',
      dosageForm: 'Tablet',
      strengths: ['50mg', '75mg'],
      commonDosage: '50mg TDS',
      duration: '3-5 days',
      contraindications: ['Gastric ulcer', 'Pregnancy', 'Blood thinners'],
      pregnancy: 'Avoid',
      class: 'NSAID'
    },
    {
      id: 'AN004',
      genericName: 'Mefenamic Acid',
      brandName: 'Ponstan',
      dosageForm: 'Capsule',
      strengths: ['250mg', '500mg'],
      commonDosage: '500mg TDS',
      duration: '3-5 days',
      contraindications: ['Gastric ulcer', 'Pregnancy'],
      pregnancy: 'Avoid',
      class: 'NSAID'
    },
    {
      id: 'AN005',
      genericName: 'Tramadol',
      brandName: 'Tramal / Tradol',
      dosageForm: 'Capsule',
      strengths: ['50mg', '100mg'],
      commonDosage: '50mg TDS-QDS',
      duration: '2-3 days',
      contraindications: ['Seizure history', 'Pregnancy'],
      pregnancy: 'Avoid',
      class: 'Opioid analgesic'
    }
  ],

  // Antifungals
  antifungals: [
    {
      id: 'AF001',
      genericName: 'Fluconazole',
      brandName: 'Diflucan',
      dosageForm: 'Capsule',
      strengths: ['50mg', '150mg'],
      commonDosage: '150mg single dose or 50mg OD',
      duration: '7-14 days',
      contraindications: ['Liver disease'],
      pregnancy: 'Avoid',
      class: 'Azole antifungal'
    },
    {
      id: 'AF002',
      genericName: 'Nystatin',
      brandName: 'Mycostatin',
      dosageForm: 'Oral suspension',
      strengths: ['100,000 units/ml'],
      commonDosage: '5ml QDS (swish and swallow)',
      duration: '7-14 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'Polyene antifungal'
    },
    {
      id: 'AF003',
      genericName: 'Miconazole',
      brandName: 'Daktarin',
      dosageForm: 'Oral gel',
      strengths: ['2%'],
      commonDosage: 'Apply QDS',
      duration: '7-14 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'Azole antifungal'
    }
  ],

  // Antihistamines
  antihistamines: [
    {
      id: 'AH001',
      genericName: 'Cetirizine',
      brandName: 'Zyrtec',
      dosageForm: 'Tablet',
      strengths: ['10mg'],
      commonDosage: '10mg OD',
      duration: '3-5 days',
      contraindications: ['Severe kidney disease'],
      pregnancy: 'Safe',
      class: 'Antihistamine'
    },
    {
      id: 'AH002',
      genericName: 'Loratadine',
      brandName: 'Claritine',
      dosageForm: 'Tablet',
      strengths: ['10mg'],
      commonDosage: '10mg OD',
      duration: '3-5 days',
      contraindications: ['Liver disease'],
      pregnancy: 'Safe',
      class: 'Antihistamine'
    }
  ],

  // Gastric Protection
  gastroprotection: [
    {
      id: 'GP001',
      genericName: 'Omeprazole',
      brandName: 'Losec',
      dosageForm: 'Capsule',
      strengths: ['20mg', '40mg'],
      commonDosage: '20mg OD (before breakfast)',
      duration: '5-7 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'PPI'
    },
    {
      id: 'GP002',
      genericName: 'Ranitidine',
      brandName: 'Zantac',
      dosageForm: 'Tablet',
      strengths: ['150mg'],
      commonDosage: '150mg BD',
      duration: '5-7 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'H2 blocker'
    }
  ],

  // Mouthwashes
  mouthwashes: [
    {
      id: 'MW001',
      genericName: 'Chlorhexidine Gluconate',
      brandName: 'Corsodyl / Hexidine',
      dosageForm: 'Mouthwash',
      strengths: ['0.12%', '0.2%'],
      commonDosage: '10ml BD (after brushing)',
      duration: '7-14 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'Antiseptic'
    },
    {
      id: 'MW002',
      genericName: 'Benzydamine',
      brandName: 'Difflam',
      dosageForm: 'Mouthwash',
      strengths: ['0.15%'],
      commonDosage: '15ml TDS-QDS',
      duration: '5-7 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'Anti-inflammatory'
    }
  ],

  // Topical Gels
  topicalGels: [
    {
      id: 'TG001',
      genericName: 'Choline Salicylate',
      brandName: 'Bonjela',
      dosageForm: 'Oral gel',
      strengths: ['8.7%'],
      commonDosage: 'Apply TDS-QDS',
      duration: '3-5 days',
      contraindications: ['Aspirin allergy'],
      pregnancy: 'Avoid',
      class: 'Topical analgesic'
    },
    {
      id: 'TG002',
      genericName: 'Lidocaine',
      brandName: 'Xylocaine gel',
      dosageForm: 'Gel',
      strengths: ['2%'],
      commonDosage: 'Apply as needed',
      duration: 'As needed',
      contraindications: ['Lidocaine allergy'],
      pregnancy: 'Safe',
      class: 'Local anesthetic'
    }
  ],

  // Vitamins & Supplements
  vitamins: [
    {
      id: 'VT001',
      genericName: 'Vitamin B Complex',
      brandName: 'Becosules',
      dosageForm: 'Capsule',
      strengths: ['Standard'],
      commonDosage: '1 capsule OD',
      duration: '30 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'Vitamin'
    },
    {
      id: 'VT002',
      genericName: 'Vitamin C',
      brandName: 'Celin',
      dosageForm: 'Tablet',
      strengths: ['500mg'],
      commonDosage: '500mg OD',
      duration: '30 days',
      contraindications: ['None'],
      pregnancy: 'Safe',
      class: 'Vitamin'
    }
  ],

  // Pediatric Formulations
  pediatric: [
    {
      id: 'PD001',
      genericName: 'Paracetamol',
      brandName: 'Panadol Syrup',
      dosageForm: 'Syrup',
      strengths: ['120mg/5ml'],
      commonDosage: '10-15mg/kg TDS-QDS',
      duration: '3-5 days',
      contraindications: ['Liver disease'],
      pregnancy: 'N/A',
      class: 'Analgesic'
    },
    {
      id: 'PD002',
      genericName: 'Ibuprofen',
      brandName: 'Brufen Syrup',
      dosageForm: 'Syrup',
      strengths: ['100mg/5ml'],
      commonDosage: '5-10mg/kg TDS',
      duration: '3-5 days',
      contraindications: ['Gastric ulcer', 'Asthma'],
      pregnancy: 'N/A',
      class: 'NSAID'
    },
    {
      id: 'PD003',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil Suspension',
      dosageForm: 'Suspension',
      strengths: ['125mg/5ml', '250mg/5ml'],
      commonDosage: '20-40mg/kg/day divided TDS',
      duration: '5-7 days',
      contraindications: ['Penicillin allergy'],
      pregnancy: 'N/A',
      class: 'Antibiotic'
    }
  ]
};

// Dosage abbreviations
export const dosageAbbreviations = {
  'OD': 'Once daily',
  'BD': 'Twice daily',
  'TDS': 'Three times daily',
  'QDS': 'Four times daily',
  'PRN': 'As needed',
  'HS': 'At bedtime',
  'AC': 'Before meals',
  'PC': 'After meals'
};
