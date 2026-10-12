/**
 * MediMatch AI - API Service with Seamless Fallback Engine
 * Connects to Spring Boot backend (/api) and falls back to client-side
 * simulation if backend is offline.
 */
import { evaluateMedicinePair, standardizeMedicineName, parseActiveIngredients } from '../utils/nlpMatcher';

// Realistic sample formulary dataset with verified active ingredients
export const INITIAL_MEDICINES = [
  {
    id: 1,
    name: 'Dolo 650 Tablet',
    brandName: 'Dolo',
    genericName: 'Paracetamol',
    composition: 'Paracetamol 650mg',
    dosageForm: 'tablet',
    strength: '650mg',
    manufacturer: 'Micro Labs Ltd',
    category: 'Analgesics / Antipyretics',
    atcCode: 'N02BE01',
    price: 33.5,
  },
  {
    id: 2,
    name: 'Calpol 650mg Tablet',
    brandName: 'Calpol',
    genericName: 'Paracetamol',
    composition: 'Paracetamol 650mg',
    dosageForm: 'tablet',
    strength: '650mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    category: 'Analgesics / Antipyretics',
    atcCode: 'N02BE01',
    price: 32.8,
  },
  {
    id: 3,
    name: 'Crocin 650 Advance Tablet',
    brandName: 'Crocin Advance',
    genericName: 'Paracetamol',
    composition: 'Paracetamol 650mg',
    dosageForm: 'tablet',
    strength: '650mg',
    manufacturer: 'GlaxoSmithKline Consumer Healthcare',
    category: 'Analgesics / Antipyretics',
    atcCode: 'N02BE01',
    price: 34.0,
  },
  {
    id: 4,
    name: 'Pacimol 500 Tablet',
    brandName: 'Pacimol',
    genericName: 'Paracetamol',
    composition: 'Paracetamol 500mg',
    dosageForm: 'tablet',
    strength: '500mg',
    manufacturer: 'Ipca Laboratories Ltd',
    category: 'Analgesics / Antipyretics',
    atcCode: 'N02BE01',
    price: 20.0,
  },
  {
    id: 5,
    name: 'Augmentin 625 Duo Tablet',
    brandName: 'Augmentin Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosageForm: 'tablet',
    strength: '625mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    category: 'Antibiotics',
    atcCode: 'J01CR02',
    price: 210.0,
  },
  {
    id: 6,
    name: 'Amoxyclav 625 Tablet',
    brandName: 'Amoxyclav',
    genericName: 'Amoxicillin + Clavulanic Acid',
    composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    dosageForm: 'tablet',
    strength: '625mg',
    manufacturer: 'Abbott Healthcare',
    category: 'Antibiotics',
    atcCode: 'J01CR02',
    price: 198.5,
  },
  {
    id: 7,
    name: 'Azithral 500 Tablet',
    brandName: 'Azithral',
    genericName: 'Azithromycin',
    composition: 'Azithromycin 500mg',
    dosageForm: 'tablet',
    strength: '500mg',
    manufacturer: 'Alembic Pharmaceuticals Ltd',
    category: 'Macrolide Antibiotics',
    atcCode: 'J01FA10',
    price: 125.0,
  },
  {
    id: 8,
    name: 'Azee 500 Tablet',
    brandName: 'Azee',
    genericName: 'Azithromycin',
    composition: 'Azithromycin 500mg',
    dosageForm: 'tablet',
    strength: '500mg',
    manufacturer: 'Cipla Ltd',
    category: 'Macrolide Antibiotics',
    atcCode: 'J01FA10',
    price: 121.5,
  },
  {
    id: 9,
    name: 'Telma 40 Tablet',
    brandName: 'Telma',
    genericName: 'Telmisartan',
    composition: 'Telmisartan 40mg',
    dosageForm: 'tablet',
    strength: '40mg',
    manufacturer: 'Glenmark Pharmaceuticals',
    category: 'Antihypertensives',
    atcCode: 'C09CA07',
    price: 130.0,
  },
  {
    id: 10,
    name: 'Telmikind 40 Tablet',
    brandName: 'Telmikind',
    genericName: 'Telmisartan',
    composition: 'Telmisartan 40mg',
    dosageForm: 'tablet',
    strength: '40mg',
    manufacturer: 'Mankind Pharma',
    category: 'Antihypertensives',
    atcCode: 'C09CA07',
    price: 88.0,
  },
  {
    id: 11,
    name: 'Pantocid 40 Tablet',
    brandName: 'Pantocid',
    genericName: 'Pantoprazole',
    composition: 'Pantoprazole 40mg',
    dosageForm: 'tablet',
    strength: '40mg',
    manufacturer: 'Sun Pharmaceutical Industries',
    category: 'Proton Pump Inhibitors',
    atcCode: 'A02BC02',
    price: 165.0,
  },
  {
    id: 12,
    name: 'Pan 40 Tablet',
    brandName: 'Pan',
    genericName: 'Pantoprazole',
    composition: 'Pantoprazole 40mg',
    dosageForm: 'tablet',
    strength: '40mg',
    manufacturer: 'Alkem Laboratories Ltd',
    category: 'Proton Pump Inhibitors',
    atcCode: 'A02BC02',
    price: 155.0,
  },
  {
    id: 13,
    name: 'Prednisone 5mg Tablet',
    brandName: 'Prednisone',
    genericName: 'Prednisone',
    composition: 'Prednisone 5mg',
    dosageForm: 'tablet',
    strength: '5mg',
    manufacturer: 'Pfizer',
    category: 'Corticosteroids',
    atcCode: 'H02AB07',
    price: 45.0,
  },
  {
    id: 14,
    name: 'Prednisolone 5mg Tablet',
    brandName: 'Prednisolone',
    genericName: 'Prednisolone',
    composition: 'Prednisolone 5mg',
    dosageForm: 'tablet',
    strength: '5mg',
    manufacturer: 'GSK',
    category: 'Corticosteroids',
    atcCode: 'H02AB06',
    price: 48.0,
  },
  {
    id: 15,
    name: 'Celebrex 200mg Capsule',
    brandName: 'Celebrex',
    genericName: 'Celecoxib',
    composition: 'Celecoxib 200mg',
    dosageForm: 'capsule',
    strength: '200mg',
    manufacturer: 'Pfizer Inc',
    category: 'NSAIDs',
    atcCode: 'M01AH01',
    price: 240.0,
  },
  {
    id: 16,
    name: 'Celexa 20mg Tablet',
    brandName: 'Celexa',
    genericName: 'Citalopram',
    composition: 'Citalopram Hydrobromide 20mg',
    dosageForm: 'tablet',
    strength: '20mg',
    manufacturer: 'AbbVie',
    category: 'Antidepressants (SSRI)',
    atcCode: 'N06AB04',
    price: 220.0,
  },
];

let localMedicinesStore = [...INITIAL_MEDICINES];

/**
 * Check if the Spring Boot backend is reachable
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      return { online: true, details: data };
    }
    return { online: false, error: 'Non-200 response' };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

/**
 * Fetch all registered medicines
 */
export async function getMedicines() {
  try {
    const res = await fetch('/api/medicines', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return { data, source: 'backend' };
    }
  } catch {
    // Backend offline, fallback to local store
  }
  return { data: localMedicinesStore, source: 'local-engine' };
}

/**
 * Add a new medicine
 */
export async function addMedicine(newMedicine) {
  try {
    const res = await fetch('/api/medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMedicine),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return { data, source: 'backend' };
    }
  } catch {
    // Fallback to local
  }

  const created = {
    ...newMedicine,
    id: Date.now(),
  };
  localMedicinesStore = [created, ...localMedicinesStore];
  return { data: created, source: 'local-engine' };
}

/**
 * Search potential duplicates against current database
 */
export async function searchDuplicates(queryMedicine, threshold = 40) {
  try {
    const res = await fetch('/api/medicines/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: queryMedicine,
        threshold: threshold,
      }),
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const data = await res.json();
      return { results: data, source: 'backend' };
    }
  } catch {
    // Backend offline, fallback to local NLP matching
  }

  // Simulated Local NLP Search
  const results = localMedicinesStore
    .map((med) => {
      const evaluation = evaluateMedicinePair(
        {
          name: queryMedicine.name || queryMedicine,
          composition: queryMedicine.composition || '',
          dosageForm: queryMedicine.dosageForm || '',
          strength: queryMedicine.strength || '',
        },
        med
      );
      return {
        medicine: med,
        evaluation,
        overallScore: evaluation.scores.overallScore,
      };
    })
    .filter((item) => item.overallScore >= threshold || item.evaluation.riskLevel === 'CRITICAL')
    .sort((a, b) => b.overallScore - a.overallScore);

  return { results, source: 'local-engine' };
}

/**
 * Side-by-side comparison between two arbitrary medicines
 */
export async function compareMedicines(medA, medB) {
  try {
    const res = await fetch('/api/medicines/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineA: medA, medicineB: medB }),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      return { evaluation: data, source: 'backend' };
    }
  } catch {
    // Fallback
  }

  const evaluation = evaluateMedicinePair(medA, medB);
  return { evaluation, source: 'local-engine' };
}

/**
 * Retrieve sample pharmacy audit records
 */
export function getPharmacyAuditBatches() {
  const auditPairs = [
    {
      batchId: 'AUD-2026-001',
      dept: 'Central Inpatient Pharmacy',
      medA: {
        name: 'Dolo 650 Tablet',
        composition: 'Paracetamol 650mg',
        strength: '650mg',
        dosageForm: 'tablet',
        manufacturer: 'Micro Labs',
      },
      medB: {
        name: 'Calpol 650mg Tablet',
        composition: 'Paracetamol 650mg',
        strength: '650mg',
        dosageForm: 'tablet',
        manufacturer: 'GSK',
      },
    },
    {
      batchId: 'AUD-2026-002',
      dept: 'ICU Critical Care Ward',
      medA: {
        name: 'Celebrex 200mg',
        composition: 'Celecoxib 200mg',
        strength: '200mg',
        dosageForm: 'capsule',
        manufacturer: 'Pfizer',
      },
      medB: {
        name: 'Celexa 20mg',
        composition: 'Citalopram 20mg',
        strength: '20mg',
        dosageForm: 'tablet',
        manufacturer: 'AbbVie',
      },
    },
    {
      batchId: 'AUD-2026-003',
      dept: 'Emergency Dispensary',
      medA: {
        name: 'Prednisone 5mg',
        composition: 'Prednisone 5mg',
        strength: '5mg',
        dosageForm: 'tablet',
        manufacturer: 'Pfizer',
      },
      medB: {
        name: 'Prednisolone 5mg',
        composition: 'Prednisolone 5mg',
        strength: '5mg',
        dosageForm: 'tablet',
        manufacturer: 'GSK',
      },
    },
    {
      batchId: 'AUD-2026-004',
      dept: 'Pediatric Wing',
      medA: {
        name: 'Crocin 650mg Advance',
        composition: 'Paracetamol 650mg',
        strength: '650mg',
        dosageForm: 'tablet',
        manufacturer: 'GSK',
      },
      medB: {
        name: 'Pacimol 500mg',
        composition: 'Paracetamol 500mg',
        strength: '500mg',
        dosageForm: 'tablet',
        manufacturer: 'Ipca',
      },
    },
    {
      batchId: 'AUD-2026-005',
      dept: 'Outpatient Clinic',
      medA: {
        name: 'Augmentin 625 Duo',
        composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
        strength: '625mg',
        dosageForm: 'tablet',
        manufacturer: 'GSK',
      },
      medB: {
        name: 'Amoxyclav 625',
        composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
        strength: '625mg',
        dosageForm: 'tablet',
        manufacturer: 'Abbott',
      },
    },
  ];

  return auditPairs.map((audit) => ({
    ...audit,
    evaluation: evaluateMedicinePair(audit.medA, audit.medB),
  }));
}
