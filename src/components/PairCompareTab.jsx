import React, { useState } from 'react';
import { GitCompare, ArrowRightLeft, ShieldAlert, CheckCircle, Info, Activity, Sparkles } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import { ClassificationBadge, AlertBanner } from './AlertBadge';

export default function PairCompareTab({ comparePair, onRunCompare }) {
  const [medA, setMedA] = useState(
    comparePair?.medA || {
      name: 'Dolo 650 Tablet',
      composition: 'Paracetamol 650mg',
      dosageForm: 'tablet',
      strength: '650mg',
      manufacturer: 'Micro Labs Ltd',
    }
  );

  const [medB, setMedB] = useState(
    comparePair?.medB || {
      name: 'Calpol 650mg Tablet',
      composition: 'Paracetamol 650mg',
      dosageForm: 'tablet',
      strength: '650mg',
      manufacturer: 'GlaxoSmithKline',
    }
  );

  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const samplePairs = [
    {
      title: 'Generic Duplicate (Dolo vs Calpol)',
      a: { name: 'Dolo 650 Tablet', composition: 'Paracetamol 650mg', dosageForm: 'tablet', strength: '650mg', manufacturer: 'Micro Labs' },
      b: { name: 'Calpol 650mg Tablet', composition: 'Paracetamol 650mg', dosageForm: 'tablet', strength: '650mg', manufacturer: 'GSK' },
    },
    {
      title: 'LASA Hazard (Celebrex vs Celexa)',
      a: { name: 'Celebrex 200mg Capsule', composition: 'Celecoxib 200mg', dosageForm: 'capsule', strength: '200mg', manufacturer: 'Pfizer' },
      b: { name: 'Celexa 20mg Tablet', composition: 'Citalopram Hydrobromide 20mg', dosageForm: 'tablet', strength: '20mg', manufacturer: 'AbbVie' },
    },
    {
      title: 'Strength Mismatch (Pacimol 500 vs Dolo 650)',
      a: { name: 'Pacimol 500 Tablet', composition: 'Paracetamol 500mg', dosageForm: 'tablet', strength: '500mg', manufacturer: 'Ipca' },
      b: { name: 'Dolo 650 Tablet', composition: 'Paracetamol 650mg', dosageForm: 'tablet', strength: '650mg', manufacturer: 'Micro Labs' },
    },
    {
      title: 'Combination Duplicate (Augmentin vs Amoxyclav)',
      a: { name: 'Augmentin 625 Duo Tablet', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg', dosageForm: 'tablet', strength: '625mg', manufacturer: 'GSK' },
      b: { name: 'Amoxyclav 625 Tablet', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg', dosageForm: 'tablet', strength: '625mg', manufacturer: 'Abbott' },
    },
  ];

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const res = await onRunCompare(medA, medB);
    setEvaluationResult(res);
    setLoading(false);
  };

  const loadSample = (sample) => {
    setMedA(sample.a);
    setMedB(sample.b);
    setEvaluationResult(null);
  };

  const swapMedicines = () => {
    const temp = { ...medA };
    setMedA({ ...medB });
    setMedB(temp);
    setEvaluationResult(null);
  };

  return (
    <div className="tab-content-container">
      <div className="section-hero">
        <div className="hero-text">
          <h2>Side-by-Side Medicine Pair Comparator</h2>
          <p>
            Evaluate two medicines to inspect standardization tokens, Levenshtein distance,
            Jaro-Winkler metric, active ingredient overlap, and uncertainty alerts.
          </p>
        </div>
      </div>

      {/* Preset bar */}
      <div className="card preset-bar-card">
        <span className="presets-label">Benchmark Test Cases:</span>
        <div className="preset-chips">
          {samplePairs.map((pair, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => loadSample(pair)}
            >
              {pair.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Columns */}
      <form onSubmit={handleCompare} className="card compare-inputs-card">
        <div className="compare-grid">
          {/* Medicine A */}
          <div className="med-column-box">
            <div className="column-header">
              <span className="col-tag tag-a">Medicine A</span>
              <h4>Source Candidate</h4>
            </div>

            <div className="form-group">
              <label>Medicine Name / Formulation</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Dolo 650 Tablet"
                value={medA.name}
                onChange={(e) => setMedA({ ...medA, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Active Ingredients / Salt</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Paracetamol 650mg"
                value={medA.composition}
                onChange={(e) => setMedA({ ...medA, composition: e.target.value })}
              />
            </div>

            <div className="input-row-2">
              <div className="form-group">
                <label>Dosage Form</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. tablet"
                  value={medA.dosageForm || ''}
                  onChange={(e) => setMedA({ ...medA, dosageForm: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Micro Labs"
                  value={medA.manufacturer || ''}
                  onChange={(e) => setMedA({ ...medA, manufacturer: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Center Swap Button */}
          <div className="swap-divider">
            <button
              type="button"
              className="swap-btn"
              onClick={swapMedicines}
              title="Swap Medicine A & B"
            >
              <ArrowRightLeft size={16} />
            </button>
          </div>

          {/* Medicine B */}
          <div className="med-column-box">
            <div className="column-header">
              <span className="col-tag tag-b">Medicine B</span>
              <h4>Target / Benchmark</h4>
            </div>

            <div className="form-group">
              <label>Medicine Name / Formulation</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Calpol 650mg Tablet"
                value={medB.name}
                onChange={(e) => setMedB({ ...medB, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Active Ingredients / Salt</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Paracetamol 650mg"
                value={medB.composition}
                onChange={(e) => setMedB({ ...medB, composition: e.target.value })}
              />
            </div>

            <div className="input-row-2">
              <div className="form-group">
                <label>Dosage Form</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. tablet"
                  value={medB.dosageForm || ''}
                  onChange={(e) => setMedB({ ...medB, dosageForm: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Manufacturer</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. GlaxoSmithKline"
                  value={medB.manufacturer || ''}
                  onChange={(e) => setMedB({ ...medB, manufacturer: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="compare-action-bar">
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            <GitCompare size={18} />
            {loading ? 'Computing Similarity...' : 'Run Deep Comparative Analysis'}
          </button>
        </div>
      </form>

      {/* Comparison Results */}
      {evaluationResult && (
        <div className="evaluation-report-card card">
          <div className="report-header">
            <div>
              <h3>Comparative Evaluation Report</h3>
              <p className="report-subtitle">
                Engine: {evaluationResult.source === 'backend' ? 'Spring Boot 3 API' : 'Simulated Local Engine'}
              </p>
            </div>
            <ClassificationBadge classification={evaluationResult.evaluation.classification} />
          </div>

          {/* Scores Overview Row */}
          <div className="scores-overview-grid">
            <div className="score-summary-box main-score">
              <ScoreGauge
                score={evaluationResult.evaluation.scores.overallScore}
                size={90}
                label="Overall Duplicate Score"
              />
            </div>

            <div className="score-summary-box">
              <ScoreGauge
                score={evaluationResult.evaluation.scores.nameSimilarity}
                size={70}
                label="Name Similarity"
                subtext="Blended NLP"
              />
            </div>

            <div className="score-summary-box">
              <ScoreGauge
                score={evaluationResult.evaluation.scores.ingredientScore}
                size={70}
                label="Salt Composition"
                subtext="Active Ingredient"
              />
            </div>

            <div className="score-summary-box">
              <ScoreGauge
                score={evaluationResult.evaluation.scores.jaroWinkler}
                size={70}
                label="Jaro-Winkler"
                subtext="Prefix Weighted"
              />
            </div>

            <div className="score-summary-box">
              <ScoreGauge
                score={evaluationResult.evaluation.scores.levenshtein}
                size={70}
                label="Levenshtein"
                subtext="Edit Distance"
              />
            </div>
          </div>

          {/* Safety & Uncertainty Alerts */}
          {evaluationResult.evaluation.alerts.length > 0 && (
            <div className="alerts-section">
              <h4>Safety & Uncertainty Diagnostic Alerts</h4>
              <div className="alerts-list">
                {evaluationResult.evaluation.alerts.map((alert, idx) => (
                  <AlertBanner key={idx} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* NLP Standardization Breakdown Table */}
          <div className="standardization-breakdown">
            <h4>NLP Standardization & Tokenization Breakdown</h4>
            <div className="table-responsive">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Medicine A</th>
                    <th>Medicine B</th>
                    <th>Comparison Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Cleaned Stemmed Name</strong></td>
                    <td><code>{evaluationResult.evaluation.stdA.cleanedName || '—'}</code></td>
                    <td><code>{evaluationResult.evaluation.stdB.cleanedName || '—'}</code></td>
                    <td>
                      {evaluationResult.evaluation.stdA.cleanedName === evaluationResult.evaluation.stdB.cleanedName ? (
                        <span className="text-success font-medium">Exact Match</span>
                      ) : (
                        <span>{evaluationResult.evaluation.scores.nameSimilarity}% Similar</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Extracted Strength</strong></td>
                    <td>{evaluationResult.evaluation.stdA.strength || 'None'}</td>
                    <td>{evaluationResult.evaluation.stdB.strength || 'None'}</td>
                    <td>
                      {evaluationResult.evaluation.stdA.strength === evaluationResult.evaluation.stdB.strength ? (
                        <span className="text-success">Identical Strength</span>
                      ) : (
                        <span className="text-danger font-medium">Strength Discrepancy</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Dosage Form</strong></td>
                    <td>{evaluationResult.evaluation.stdA.form || medA.dosageForm || 'Unspecified'}</td>
                    <td>{evaluationResult.evaluation.stdB.form || medB.dosageForm || 'Unspecified'}</td>
                    <td>
                      {(evaluationResult.evaluation.stdA.form || medA.dosageForm) ===
                      (evaluationResult.evaluation.stdB.form || medB.dosageForm) ? (
                        <span className="text-success">Same Form</span>
                      ) : (
                        <span className="text-warning">Different Formulation</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Extracted Token Set</strong></td>
                    <td>[{evaluationResult.evaluation.stdA.tokens.join(', ')}]</td>
                    <td>[{evaluationResult.evaluation.stdB.tokens.join(', ')}]</td>
                    <td>
                      Token Overlap: {evaluationResult.evaluation.scores.tokenOverlap}%
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Active Ingredients</strong></td>
                    <td>{medA.composition || 'None'}</td>
                    <td>{medB.composition || 'None'}</td>
                    <td>
                      <strong>{evaluationResult.evaluation.ingredientAnalysis.details}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
