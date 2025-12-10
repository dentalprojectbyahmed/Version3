// Prescription Safety Checker
// Checks patient medical history against medications

export const prescriptionSafety = {
  // Check if patient has any contraindications
  checkSafety(patient, medications) {
    const warnings = [];
    const errors = [];

    if (!patient || !medications || medications.length === 0) {
      return { safe: true, warnings: [], errors: [] };
    }

    // Extract patient medical info
    const isPregnant = patient.medicalHistory?.toLowerCase().includes('pregnant') || 
                      patient.medicalAlerts?.toLowerCase().includes('pregnant');
    const allergies = this.extractAllergies(patient);
    const conditions = this.extractConditions(patient);
    const currentMeds = this.extractCurrentMedications(patient);

    // Check each medication
    medications.forEach(med => {
      const medName = (typeof med === 'string' ? med : med.name).toLowerCase();

      // Pregnancy checks
      if (isPregnant) {
        if (this.isNSAID(medName)) {
          errors.push(`⛔ ${med.name || med}: NOT SAFE during pregnancy (NSAID)`);
        }
        if (this.isTeratogenic(medName)) {
          errors.push(`⛔ ${med.name || med}: CONTRAINDICATED in pregnancy`);
        }
      }

      // Allergy checks
      allergies.forEach(allergy => {
        if (medName.includes(allergy.toLowerCase()) || this.isCrossAllergy(medName, allergy)) {
          errors.push(`⛔ ${med.name || med}: Patient is ALLERGIC to ${allergy}`);
        }
      });

      // Drug interaction checks
      currentMeds.forEach(currentMed => {
        if (this.hasInteraction(medName, currentMed)) {
          warnings.push(`⚠️ ${med.name || med}: May interact with ${currentMed}`);
        }
      });

      // Condition-specific warnings
      if (conditions.includes('diabetes') && this.affectsBloodSugar(medName)) {
        warnings.push(`⚠️ ${med.name || med}: Monitor blood sugar (patient has diabetes)`);
      }

      if (conditions.includes('hypertension') && this.affectsBloodPressure(medName)) {
        warnings.push(`⚠️ ${med.name || med}: Monitor blood pressure (patient has hypertension)`);
      }

      if (conditions.includes('kidney') && this.isNephrotoxic(medName)) {
        warnings.push(`⚠️ ${med.name || med}: Use with caution (kidney disease)`);
      }

      if (conditions.includes('liver') && this.isHepatotoxic(medName)) {
        warnings.push(`⚠️ ${med.name || med}: Use with caution (liver disease)`);
      }

      // Blood thinner check
      if (currentMeds.some(m => m.toLowerCase().includes('warfarin') || m.toLowerCase().includes('aspirin'))) {
        if (this.isNSAID(medName)) {
          warnings.push(`⚠️ ${med.name || med}: Increased bleeding risk (patient on blood thinners)`);
        }
      }
    });

    return {
      safe: errors.length === 0,
      warnings,
      errors
    };
  },

  // Extract allergies from patient record
  extractAllergies(patient) {
    const allergies = [];
    const text = `${patient.medicalAlerts || ''} ${patient.medicalHistory || ''}`.toLowerCase();
    
    const allergyKeywords = ['penicillin', 'amoxicillin', 'sulfa', 'nsaid', 'ibuprofen', 'aspirin', 'codeine', 'latex'];
    allergyKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        allergies.push(keyword);
      }
    });

    return allergies;
  },

  // Extract medical conditions
  extractConditions(patient) {
    const conditions = [];
    const text = `${patient.medicalAlerts || ''} ${patient.medicalHistory || ''}`.toLowerCase();
    
    const conditionKeywords = ['diabetes', 'hypertension', 'kidney', 'liver', 'heart', 'asthma'];
    conditionKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        conditions.push(keyword);
      }
    });

    return conditions;
  },

  // Extract current medications
  extractCurrentMedications(patient) {
    const meds = [];
    const text = `${patient.currentMedications || ''}`.toLowerCase();
    
    if (text) {
      // Split by common separators
      const parts = text.split(/[,;\n]/);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.length > 2) {
          meds.push(trimmed);
        }
      });
    }

    return meds;
  },

  // Check if medication is NSAID
  isNSAID(medName) {
    const nsaids = ['ibuprofen', 'brufen', 'diclofenac', 'voltaren', 'naproxen', 'ponstan', 'mefenamic'];
    return nsaids.some(nsaid => medName.includes(nsaid));
  },

  // Check if medication is teratogenic
  isTeratogenic(medName) {
    const teratogenic = ['metronidazole', 'tetracycline', 'doxycycline'];
    return teratogenic.some(drug => medName.includes(drug));
  },

  // Check for cross-allergies
  isCrossAllergy(medName, allergy) {
    // Penicillin cross-allergies
    if (allergy.includes('penicillin')) {
      return medName.includes('amoxicillin') || medName.includes('augmentin') || medName.includes('ampicillin');
    }
    
    // NSAID cross-allergies
    if (allergy.includes('nsaid') || allergy.includes('ibuprofen')) {
      return this.isNSAID(medName);
    }

    return false;
  },

  // Check for drug interactions
  hasInteraction(med1, med2) {
    // Common dental drug interactions
    const interactions = {
      'metronidazole': ['warfarin', 'alcohol'],
      'erythromycin': ['warfarin', 'theophylline'],
      'azithromycin': ['warfarin']
    };

    for (const [drug, interactsWith] of Object.entries(interactions)) {
      if (med1.includes(drug) && interactsWith.some(int => med2.includes(int))) {
        return true;
      }
    }

    return false;
  },

  // Check if affects blood sugar
  affectsBloodSugar(medName) {
    return medName.includes('steroid') || medName.includes('prednisolone');
  },

  // Check if affects blood pressure
  affectsBloodPressure(medName) {
    return medName.includes('epinephrine') || medName.includes('adrenaline');
  },

  // Check if nephrotoxic
  isNephrotoxic(medName) {
    return this.isNSAID(medName) || medName.includes('aminoglycoside');
  },

  // Check if hepatotoxic
  isHepatotoxic(medName) {
    return medName.includes('paracetamol') || medName.includes('acetaminophen');
  }
};
