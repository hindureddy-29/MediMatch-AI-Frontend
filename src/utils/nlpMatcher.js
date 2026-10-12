/**
 * MediMatch AI - NLP & Fuzzy Matching Utilities
 * Implements medicine name standardization, tokenization, Levenshtein,
 * Jaro-Winkler, and Active Ingredient composition similarity.
 */

// Common medicine form stopwords and abbreviations to standardize
const FORM_MAPPINGS = {
  tab: 'tablet',
  tabs: 'tablet',
  tablets: 'tablet',
  cap: 'capsule',
  caps: 'capsule',
  capsules: 'capsule',
  syr: 'syrup',
  syrup: 'syrup',
  susp: 'suspension',
  inj: 'injection',
  oint: 'ointment',
  crm: 'cream',
  sol: 'solution',
  drops: 'drops',
  gel: 'gel',
  inf: 'infusion',
};

// Unit normalizations
const UNIT_MAPPINGS = {
  milligram: 'mg',
  milligrams: 'mg',
  gram: 'g',
  grams: 'g',
  microgram: 'mcg',
  micrograms: 'mcg',
  milliliter: 'ml',
  milliliters: 'ml',
};

/**
 * Standardizes a raw medicine name by:
 * 1. Lowercasing and trimming
 * 2. Isolating strength/dosage (e.g., 500mg, 10ml)
 * 3. Normalizing dosage forms (e.g., Tab -> tablet)
 * 4. Removing special characters and punctuation
 */
export function standardizeMedicineName(rawName = '') {
  if (!rawName) return { cleanedName: '', strength: '', form: '', tokens: [] };

  let text = rawName.toLowerCase().trim();

  // Extract strength (e.g., 500 mg, 650mg, 1.25 mcg, 100iu)
  let strengthMatch = text.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)/i);
  let strength = strengthMatch ? `${strengthMatch[1]}${strengthMatch[2].toLowerCase()}` : '';

  // Clean out common punctuation
  text = text.replace(/[-/\\()[\],+]/g, ' ');

  // Extract words
  let words = text.split(/\s+/).filter(Boolean);

  let form = '';
  let filteredTokens = [];

  for (let word of words) {
    if (FORM_MAPPINGS[word]) {
      form = FORM_MAPPINGS[word];
    } else if (word === strength.toLowerCase() || (strengthMatch && word === strengthMatch[1])) {
      // strength token, skip from core brand name
      continue;
    } else {
      // check if unit
      let mappedUnit = UNIT_MAPPINGS[word];
      if (!mappedUnit) {
        filteredTokens.push(word);
      }
    }
  }

  const cleanedName = filteredTokens.join(' ').trim();

  return {
    raw: rawName,
    cleanedName,
    strength,
    form,
    tokens: filteredTokens,
  };
}

/**
 * Standardizes active ingredient string (e.g., "Paracetamol 500mg + Caffeine 30mg")
 * into normalized list of { ingredient, strength }
 */
export function parseActiveIngredients(compositionStr = '') {
  if (!compositionStr) return [];

  const parts = compositionStr.split(/[+,/;&]|\band\b/i);

  return parts
    .map((part) => {
      let trimmed = part.trim().toLowerCase();
      let match = trimmed.match(/^(.*?)\s*(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)?)$/i);
      if (match) {
        return {
          name: match[1].trim(),
          strength: match[2].replace(/\s+/g, '').trim(),
        };
      }
      return {
        name: trimmed,
        strength: '',
      };
    })
    .filter((item) => item.name.length > 0);
}

/**
 * Calculates Levenshtein Distance between two strings
 */
export function levenshteinDistance(s1 = '', s2 = '') {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates Levenshtein Similarity (0.0 to 1.0)
 */
export function levenshteinSimilarity(s1 = '', s2 = '') {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  const dist = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return Math.max(0, (maxLen - dist) / maxLen);
}

/**
 * Calculates Jaro-Winkler Similarity (0.0 to 1.0)
 */
export function jaroWinklerSimilarity(s1 = '', s2 = '') {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix scaling (max 4 characters)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  const p = 0.1; // standard scaling factor
  return jaro + prefix * p * (1 - jaro);
}

/**
 * Token Jaccard / Overlap similarity
 */
export function tokenOverlapSimilarity(tokensA = [], tokensB = []) {
  if (tokensA.length === 0 && tokensB.length === 0) return 1.0;
  if (tokensA.length === 0 || tokensB.length === 0) return 0.0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Compare two active ingredient lists
 */
export function compareActiveIngredients(ingredientsA = [], ingredientsB = []) {
  if (ingredientsA.length === 0 || ingredientsB.length === 0) {
    return {
      status: 'UNKNOWN',
      matchScore: 0.0,
      details: 'Active ingredients not available for full verification',
      hasStrengthMismatch: false,
    };
  }

  const namesA = ingredientsA.map((i) => i.name);
  const namesB = ingredientsB.map((i) => i.name);

  // Check matching ingredients
  let matchedCount = 0;
  let strengthMismatches = [];

  for (let itemA of ingredientsA) {
    const match = ingredientsB.find(
      (itemB) =>
        itemB.name === itemA.name ||
        levenshteinSimilarity(itemB.name, itemA.name) > 0.85
    );

    if (match) {
      matchedCount++;
      if (itemA.strength && match.strength && itemA.strength !== match.strength) {
        strengthMismatches.push({
          ingredient: itemA.name,
          strengthA: itemA.strength,
          strengthB: match.strength,
        });
      }
    }
  }

  const totalIngredients = Math.max(ingredientsA.length, ingredientsB.length);
  const score = matchedCount / totalIngredients;

  let status = 'DISTINCT';
  if (score === 1.0) {
    status = 'IDENTICAL_COMPOSITION';
  } else if (score >= 0.5) {
    status = 'PARTIAL_OVERLAP';
  }

  return {
    status,
    matchScore: score,
    details: `${matchedCount}/${totalIngredients} active ingredients matched`,
    hasStrengthMismatch: strengthMismatches.length > 0,
    strengthMismatches,
  };
}

/**
 * Comprehensive duplicate analysis between two medicines
 */
export function evaluateMedicinePair(medA, medB) {
  const stdA = standardizeMedicineName(medA.name);
  const stdB = standardizeMedicineName(medB.name);

  const levScore = levenshteinSimilarity(stdA.cleanedName, stdB.cleanedName);
  const jaroScore = jaroWinklerSimilarity(stdA.cleanedName, stdB.cleanedName);
  const tokenScore = tokenOverlapSimilarity(stdA.tokens, stdB.tokens);

  // Blended name similarity
  const nameSimilarity = Math.round(
    (0.4 * jaroScore + 0.3 * levScore + 0.3 * tokenScore) * 100
  );

  // Ingredient comparison
  const ingListA =
    Array.isArray(medA.activeIngredients) && typeof medA.activeIngredients[0] === 'object'
      ? medA.activeIngredients
      : parseActiveIngredients(medA.activeIngredients || medA.composition || '');

  const ingListB =
    Array.isArray(medB.activeIngredients) && typeof medB.activeIngredients[0] === 'object'
      ? medB.activeIngredients
      : parseActiveIngredients(medB.activeIngredients || medB.composition || '');

  const ingredientAnalysis = compareActiveIngredients(ingListA, ingListB);
  const ingredientScore = Math.round(ingredientAnalysis.matchScore * 100);

  // Form & Strength check
  const formA = stdA.form || (medA.dosageForm || '').toLowerCase();
  const formB = stdB.form || (medB.dosageForm || '').toLowerCase();
  const formsMatch = formA && formB ? formA === formB : true;

  const strengthA = stdA.strength || (medA.strength || '').toLowerCase();
  const strengthB = stdB.strength || (medB.strength || '').toLowerCase();
  const directStrengthMismatch = strengthA && strengthB && strengthA !== strengthB;

  // Composite duplicate confidence score
  let overallScore = 0;
  let classification = '';
  let riskLevel = 'LOW';
  let alerts = [];

  const hasIngredients = ingListA.length > 0 && ingListB.length > 0;

  if (hasIngredients) {
    // Verified ingredients take precedence in medical duplicate detection
    overallScore = Math.round(0.65 * ingredientScore + 0.35 * nameSimilarity);

    if (ingredientAnalysis.status === 'IDENTICAL_COMPOSITION') {
      if (nameSimilarity > 75) {
        classification = 'EXACT_DUPLICATE';
        riskLevel = 'CRITICAL';
        alerts.push({
          type: 'danger',
          code: 'DUPLICATE_ENTRY',
          message: 'Both brand name and active composition indicate duplicate inventory entries.',
        });
      } else {
        classification = 'GENERIC_EQUIVALENT';
        riskLevel = 'INFO';
        alerts.push({
          type: 'info',
          code: 'THERAPEUTIC_SUBSTITUTE',
          message: 'Different brand names but identical active pharmaceutical composition (Generic alternative).',
        });
      }

      if (ingredientAnalysis.hasStrengthMismatch || directStrengthMismatch) {
        alerts.push({
          type: 'warning',
          code: 'DOSAGE_MISMATCH',
          message: `Strength variation detected: "${strengthA || 'N/A'}" vs "${strengthB || 'N/A'}". Risk of underdose or overdose.`,
        });
      }
    } else if (ingredientAnalysis.status === 'PARTIAL_OVERLAP') {
      classification = 'PARTIAL_MATCH';
      riskLevel = 'WARNING';
      alerts.push({
        type: 'warning',
        code: 'PARTIAL_COMPOSITION',
        message: 'Partial overlap in active ingredients. Check combination ratios before substitution.',
      });
    } else {
      // Ingredients differ! Check for LASA (Look-Alike Sound-Alike)
      if (nameSimilarity >= 70) {
        classification = 'LASA_ALERT';
        riskLevel = 'CRITICAL';
        alerts.push({
          type: 'danger',
          code: 'LASA_HAZARD',
          message: `CRITICAL ALERT: Look-Alike / Sound-Alike (LASA) medicine! Names are ${nameSimilarity}% similar, but active ingredients are completely different!`,
        });
      } else {
        classification = 'DISTINCT_MEDICINE';
        riskLevel = 'LOW';
      }
    }
  } else {
    // No verified active ingredients -> high uncertainty alert
    overallScore = nameSimilarity;
    classification = nameSimilarity > 75 ? 'UNVERIFIED_SUSPECTED_DUPLICATE' : 'DISTINCT_MEDICINE';
    riskLevel = nameSimilarity > 75 ? 'WARNING' : 'LOW';

    alerts.push({
      type: 'warning',
      code: 'UNCERTAINTY_FLAG',
      message: 'Active ingredient verification is incomplete or unavailable. Matching is based on standardized name tokens only.',
    });
  }

  if (!formsMatch && formA && formB) {
    alerts.push({
      type: 'info',
      code: 'DOSAGE_FORM_DIFFERENCE',
      message: `Dosage form difference: ${formA} vs ${formB}.`,
    });
  }

  return {
    medA,
    medB,
    stdA,
    stdB,
    scores: {
      overallScore,
      nameSimilarity,
      ingredientScore,
      levenshtein: Math.round(levScore * 100),
      jaroWinkler: Math.round(jaroScore * 100),
      tokenOverlap: Math.round(tokenScore * 100),
    },
    ingredientAnalysis,
    classification,
    riskLevel,
    alerts,
  };
}
