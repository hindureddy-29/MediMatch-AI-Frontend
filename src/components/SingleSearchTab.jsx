import React, { useState } from 'react';
import { Search, Sliders, Sparkles, AlertCircle, ArrowRight, CheckCircle, Info } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import { ClassificationBadge, AlertBanner } from './AlertBadge';
import { standardizeMedicineName } from '../utils/nlpMatcher';

export default function SingleSearchTab({ onSearch, onSelectForCompare }) {
  const [queryName, setQueryName] = useState('Calpol 650 Tablet');
  const [composition, setComposition] = useState('Paracetamol 650mg');
  const [threshold, setThreshold] = useState(40);
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);

  const presets = [
    { name: 'Calpol 650 Tablet', composition: 'Paracetamol 650mg' },
    { name: 'Crocin 650 Advance', composition: 'Paracetamol 650mg' },
    { name: 'Amoxyclav 625 Duo', composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg' },
    { name: 'Celexa 20mg Tab', composition: 'Citalopram 20mg' }, // Sound-alike to Celebrex!
    { name: 'Telmikind 40', composition: 'Telmisartan 40mg' },
    { name: 'Unknown Paracetamol 500mg', composition: '' }, // tests uncertainty flag
  ];

  const handleRunSearch = async (e) => {
    if (e) e.preventDefault();
    if (!queryName.trim()) return;

    setLoading(true);
    const queryObj = {
      name: queryName,
      composition: composition,
    };

    const res = await onSearch(queryObj, threshold);
    setResultsData(res);
    setLoading(false);
  };

  const handleApplyPreset = (preset) => {
    setQueryName(preset.name);
    setComposition(preset.composition);
  };

  // Preview real-time standardized tokenization of query
  const standardizedPreview = standardizeMedicineName(queryName);

  return (
    <div className="tab-content-container">
      {/* Intro hero banner */}
      <div className="section-hero">
        <div className="hero-text">
          <h2>Duplicate Medicine & Generic Substitute Detection</h2>
          <p>
            Standardize medicine brand strings, analyze active pharmaceutical compositions,
            and screen against the database for duplicates and Look-Alike Sound-Alike (LASA) risks.
          </p>
        </div>
      </div>

      {/* Query Search Card */}
      <div className="card query-card">
        <form onSubmit={handleRunSearch} className="search-form">
          <div className="input-grid">
            <div className="form-group">
              <label htmlFor="medicine-query">
                Medicine Name / Brand / Formulation <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <Search size={18} className="input-icon" />
                <input
                  id="medicine-query"
                  type="text"
                  className="text-input"
                  placeholder="e.g. Dolo 650 Tablet, Calpol 650mg"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="medicine-comp">
                Active Ingredient / Salt Composition{' '}
                <span className="optional-tag">(Optional: for chemical verification)</span>
              </label>
              <input
                id="medicine-comp"
                type="text"
                className="text-input"
                placeholder="e.g. Paracetamol 650mg or Amoxicillin 500mg + Clavulanic Acid 125mg"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="presets-row">
            <span className="presets-label">Quick Test Presets:</span>
            <div className="preset-chips">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip"
                  onClick={() => handleApplyPreset(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* NLP Live Tokenizer Preview */}
          <div className="nlp-preview-box">
            <div className="nlp-preview-header">
              <Sparkles size={14} className="text-primary" />
              <span>Real-Time NLP Preprocessing Preview:</span>
            </div>
            <div className="nlp-preview-tags">
              <span className="nlp-tag">
                Cleaned Name: <strong>{standardizedPreview.cleanedName || '—'}</strong>
              </span>
              <span className="nlp-tag">
                Extracted Strength: <strong>{standardizedPreview.strength || 'None detected'}</strong>
              </span>
              <span className="nlp-tag">
                Dosage Form: <strong>{standardizedPreview.form || 'Unspecified'}</strong>
              </span>
              <span className="nlp-tag">
                Tokens: [{standardizedPreview.tokens.join(', ')}]
              </span>
            </div>
          </div>

          <div className="form-footer">
            <div className="slider-group">
              <Sliders size={16} />
              <label htmlFor="threshold-slider">
                Match Sensitivity Threshold: <strong>{threshold}%</strong>
              </label>
              <input
                id="threshold-slider"
                type="range"
                min="20"
                max="90"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={18} />
              {loading ? 'Evaluating Similarity...' : 'Detect Duplicates'}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {resultsData && (
        <div className="results-container">
          <div className="results-header">
            <div>
              <h3>
                Detection Results ({resultsData.results.length} Potential Matches Found)
              </h3>
              <p className="results-subtext">
                Evaluated against registered formulary using NLP Levenshtein, Jaro-Winkler, and Active
                Ingredient Verification.
              </p>
            </div>
            <span className="engine-badge">
              Engine: {resultsData.source === 'backend' ? 'Java Spring Boot' : 'Simulated NLP Engine'}
            </span>
          </div>

          {resultsData.results.length === 0 ? (
            <div className="empty-state-card">
              <CheckCircle size={40} className="text-success" />
              <h4>No Duplicate or LASA Conflict Detected</h4>
              <p>
                No registered medicine exceeded the {threshold}% similarity threshold. This medicine appears
                unique in the formulary.
              </p>
            </div>
          ) : (
            <div className="matches-list">
              {resultsData.results.map((matchItem, index) => {
                const med = matchItem.medicine;
                const evalData = matchItem.evaluation;
                const scores = evalData.scores;

                return (
                  <div key={index} className="match-card">
                    <div className="match-card-grid">
                      {/* Left: Overall Gauge */}
                      <div className="gauge-column">
                        <ScoreGauge
                          score={scores.overallScore}
                          size={76}
                          label="Duplicate Score"
                        />
                        <div className="score-submetrics">
                          <div>Name: <strong>{scores.nameSimilarity}%</strong></div>
                          <div>Salt: <strong>{scores.ingredientScore}%</strong></div>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="details-column">
                        <div className="card-top-row">
                          <h4 className="match-title">{med.name}</h4>
                          <ClassificationBadge classification={evalData.classification} />
                        </div>

                        <div className="meta-details-grid">
                          <div>
                            <span className="label">Active Salt:</span>{' '}
                            <span className="value">{med.composition || 'Not listed'}</span>
                          </div>
                          <div>
                            <span className="label">Form & Strength:</span>{' '}
                            <span className="value">{med.dosageForm} • {med.strength}</span>
                          </div>
                          <div>
                            <span className="label">Manufacturer:</span>{' '}
                            <span className="value">{med.manufacturer}</span>
                          </div>
                          <div>
                            <span className="label">Therapeutic Class:</span>{' '}
                            <span className="value">{med.category}</span>
                          </div>
                        </div>

                        {/* Safety Alerts */}
                        {evalData.alerts.length > 0 && (
                          <div className="alerts-list">
                            {evalData.alerts.map((alert, aIdx) => (
                              <AlertBanner key={aIdx} alert={alert} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: Compare action */}
                      <div className="action-column">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() =>
                            onSelectForCompare(
                              {
                                name: queryName,
                                composition: composition,
                                strength: standardizedPreview.strength,
                                dosageForm: standardizedPreview.form,
                              },
                              med
                            )
                          }
                        >
                          Deep Compare <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
