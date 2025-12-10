// 35 Dental Conditions for Prescription System

export const dentalConditions = [
  // Pain Conditions
  {
    id: 'C001',
    name: 'Post-Extraction Pain',
    category: 'Pain',
    description: 'Pain following tooth extraction',
    commonSymptoms: ['Pain', 'Swelling', 'Bleeding'],
    severity: 'moderate'
  },
  {
    id: 'C002',
    name: 'Acute Pulpitis',
    category: 'Pain',
    description: 'Inflammation of dental pulp',
    commonSymptoms: ['Severe toothache', 'Sensitivity', 'Night pain'],
    severity: 'severe'
  },
  {
    id: 'C003',
    name: 'Pericoronitis',
    category: 'Infection',
    description: 'Inflammation around partially erupted tooth',
    commonSymptoms: ['Gum swelling', 'Pain', 'Difficulty opening mouth'],
    severity: 'moderate'
  },
  {
    id: 'C004',
    name: 'Dry Socket',
    category: 'Post-Operative',
    description: 'Alveolar osteitis after extraction',
    commonSymptoms: ['Severe pain', 'Bad breath', 'Empty socket'],
    severity: 'severe'
  },
  {
    id: 'C005',
    name: 'Dental Abscess',
    category: 'Infection',
    description: 'Pus collection in tooth or gum',
    commonSymptoms: ['Severe pain', 'Swelling', 'Fever', 'Pus'],
    severity: 'severe'
  },
  
  // Gum Conditions
  {
    id: 'C006',
    name: 'Gingivitis',
    category: 'Periodontal',
    description: 'Gum inflammation',
    commonSymptoms: ['Bleeding gums', 'Redness', 'Swelling'],
    severity: 'mild'
  },
  {
    id: 'C007',
    name: 'Periodontitis',
    category: 'Periodontal',
    description: 'Advanced gum disease',
    commonSymptoms: ['Gum recession', 'Loose teeth', 'Bad breath'],
    severity: 'severe'
  },
  
  // Oral Infections
  {
    id: 'C008',
    name: 'Oral Candidiasis',
    category: 'Infection',
    description: 'Fungal infection (thrush)',
    commonSymptoms: ['White patches', 'Burning sensation', 'Loss of taste'],
    severity: 'moderate'
  },
  {
    id: 'C009',
    name: 'Herpes Simplex',
    category: 'Viral',
    description: 'Viral cold sores',
    commonSymptoms: ['Blisters', 'Pain', 'Tingling'],
    severity: 'mild'
  },
  {
    id: 'C010',
    name: 'Aphthous Ulcers',
    category: 'Ulcers',
    description: 'Canker sores',
    commonSymptoms: ['Painful ulcers', 'Difficulty eating'],
    severity: 'mild'
  },
  
  // TMJ & Facial Pain
  {
    id: 'C011',
    name: 'TMJ Pain',
    category: 'Pain',
    description: 'Temporomandibular joint disorder',
    commonSymptoms: ['Jaw pain', 'Clicking', 'Limited opening'],
    severity: 'moderate'
  },
  {
    id: 'C012',
    name: 'Trigeminal Neuralgia',
    category: 'Pain',
    description: 'Severe facial nerve pain',
    commonSymptoms: ['Electric shock pain', 'Facial spasms'],
    severity: 'severe'
  },
  
  // Post-Operative Conditions
  {
    id: 'C013',
    name: 'Post-Operative Pain',
    category: 'Post-Operative',
    description: 'General post-surgical pain',
    commonSymptoms: ['Pain', 'Swelling', 'Discomfort'],
    severity: 'moderate'
  },
  {
    id: 'C014',
    name: 'Post-RCT Pain',
    category: 'Post-Operative',
    description: 'Pain after root canal treatment',
    commonSymptoms: ['Tenderness', 'Mild pain', 'Sensitivity'],
    severity: 'mild'
  },
  {
    id: 'C015',
    name: 'Post-Implant Pain',
    category: 'Post-Operative',
    description: 'Pain after implant placement',
    commonSymptoms: ['Soreness', 'Swelling', 'Bruising'],
    severity: 'moderate'
  },
  {
    id: 'C016',
    name: 'Post-Surgical Infection',
    category: 'Infection',
    description: 'Infection after dental surgery',
    commonSymptoms: ['Fever', 'Pus', 'Increased pain', 'Swelling'],
    severity: 'severe'
  },
  
  // Trauma
  {
    id: 'C017',
    name: 'Dental Trauma',
    category: 'Trauma',
    description: 'Tooth injury from accident',
    commonSymptoms: ['Pain', 'Bleeding', 'Loose tooth', 'Fracture'],
    severity: 'severe'
  },
  
  // Orthodontic
  {
    id: 'C018',
    name: 'Orthodontic Pain',
    category: 'Pain',
    description: 'Pain from braces adjustment',
    commonSymptoms: ['Tooth soreness', 'Difficulty chewing'],
    severity: 'mild'
  },
  
  // Sensitivity
  {
    id: 'C019',
    name: 'Tooth Sensitivity',
    category: 'Sensitivity',
    description: 'Hypersensitivity to hot/cold',
    commonSymptoms: ['Sharp pain', 'Cold sensitivity'],
    severity: 'mild'
  },
  
  // Pre-Medication Protocols
  {
    id: 'C020',
    name: 'Pre-Medication (Cardiac)',
    category: 'Prophylaxis',
    description: 'Antibiotic prophylaxis for heart patients',
    commonSymptoms: ['Prevention'],
    severity: 'prophylactic'
  },
  {
    id: 'C021',
    name: 'Pre-Medication (Immunocompromised)',
    category: 'Prophylaxis',
    description: 'Prophylaxis for immune-compromised patients',
    commonSymptoms: ['Prevention'],
    severity: 'prophylactic'
  },
  
  // Emergency
  {
    id: 'C022',
    name: 'Toothache (Undiagnosed)',
    category: 'Emergency',
    description: 'Acute toothache requiring diagnosis',
    commonSymptoms: ['Pain'],
    severity: 'moderate'
  },
  {
    id: 'C023',
    name: 'Emergency Analgesic',
    category: 'Emergency',
    description: 'Immediate pain relief needed',
    commonSymptoms: ['Severe pain'],
    severity: 'severe'
  },
  {
    id: 'C024',
    name: 'Emergency Antibiotic',
    category: 'Emergency',
    description: 'Immediate infection control',
    commonSymptoms: ['Infection signs'],
    severity: 'severe'
  },
  
  // Pediatric
  {
    id: 'C025',
    name: 'Pediatric Pain',
    category: 'Pediatric',
    description: 'Pain management for children',
    commonSymptoms: ['Pain in children'],
    severity: 'moderate'
  },
  {
    id: 'C026',
    name: 'Pediatric Infection',
    category: 'Pediatric',
    description: 'Infection in children',
    commonSymptoms: ['Fever', 'Swelling', 'Pain'],
    severity: 'moderate'
  },
  
  // Allergic & Inflammatory
  {
    id: 'C027',
    name: 'Allergic Reaction',
    category: 'Allergy',
    description: 'Allergic response in oral cavity',
    commonSymptoms: ['Swelling', 'Rash', 'Itching'],
    severity: 'moderate'
  },
  {
    id: 'C028',
    name: 'Angular Cheilitis',
    category: 'Infection',
    description: 'Cracks at corners of mouth',
    commonSymptoms: ['Cracks', 'Redness', 'Pain'],
    severity: 'mild'
  },
  {
    id: 'C029',
    name: 'Denture Stomatitis',
    category: 'Infection',
    description: 'Inflammation under dentures',
    commonSymptoms: ['Redness', 'Soreness', 'Burning'],
    severity: 'mild'
  },
  {
    id: 'C030',
    name: 'Burning Mouth Syndrome',
    category: 'Pain',
    description: 'Chronic burning sensation',
    commonSymptoms: ['Burning', 'Dry mouth', 'Altered taste'],
    severity: 'moderate'
  },
  
  // Advanced Infections
  {
    id: 'C031',
    name: 'Facial Cellulitis',
    category: 'Infection',
    description: 'Spreading facial infection',
    commonSymptoms: ['Facial swelling', 'Fever', 'Redness'],
    severity: 'severe'
  },
  {
    id: 'C032',
    name: 'Maxillary Sinusitis',
    category: 'Infection',
    description: 'Sinus infection from dental origin',
    commonSymptoms: ['Facial pain', 'Nasal discharge', 'Headache'],
    severity: 'moderate'
  },
  {
    id: 'C033',
    name: 'Salivary Gland Infection',
    category: 'Infection',
    description: 'Sialadenitis',
    commonSymptoms: ['Gland swelling', 'Pain', 'Dry mouth'],
    severity: 'moderate'
  },
  {
    id: 'C034',
    name: 'Oral Thrush (Severe)',
    category: 'Infection',
    description: 'Severe fungal infection',
    commonSymptoms: ['Extensive white patches', 'Pain', 'Difficulty swallowing'],
    severity: 'severe'
  },
  {
    id: 'C035',
    name: 'Wisdom Tooth Infection',
    category: 'Infection',
    description: 'Infection around wisdom tooth',
    commonSymptoms: ['Pain', 'Swelling', 'Difficulty opening mouth'],
    severity: 'moderate'
  }
];

// Category groupings
export const conditionCategories = {
  'Pain': ['C001', 'C002', 'C011', 'C012', 'C018', 'C019', 'C022', 'C030'],
  'Infection': ['C003', 'C005', 'C008', 'C016', 'C024', 'C026', 'C028', 'C029', 'C031', 'C032', 'C033', 'C034', 'C035'],
  'Post-Operative': ['C004', 'C013', 'C014', 'C015'],
  'Periodontal': ['C006', 'C007'],
  'Viral': ['C009'],
  'Ulcers': ['C010'],
  'Trauma': ['C017'],
  'Sensitivity': ['C019'],
  'Prophylaxis': ['C020', 'C021'],
  'Emergency': ['C022', 'C023', 'C024'],
  'Pediatric': ['C025', 'C026'],
  'Allergy': ['C027']
};
