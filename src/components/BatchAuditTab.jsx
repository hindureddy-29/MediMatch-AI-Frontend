import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Filter, Eye, ArrowRight } from 'lucide-react';
import { getPharmacyAuditBatches } from '../services/apiService';
import ScoreGauge from './ScoreGauge';
import { ClassificationBadge, AlertBanner } from './AlertBadge';

export default function BatchAuditTab({ onSelectForCompare }) {
  const [auditRecords, setAuditRecords] = useState([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const records = getPharmacyAuditBatches();
    setAuditRecords(records);
  }, []);

  const totalBatches = auditRecords.length;
  const criticalCount = auditRecords.filter((r) => r.evaluation.riskLevel === 'CRITICAL').length;
  const warningCount = auditRecords.filter((r) => r.evaluation.riskLevel === 'WARNING').length;
  const genericCount = auditRecords.filter((r) => r.evaluation.classification === 'GENERIC_EQUIVALENT').length;

  const filteredRecords = auditRecords.filter((r) => {
    if (filter === 'CRITICAL') return r.evaluation.riskLevel === 'CRITICAL';
    if (filter === 'WARNING') return r.evaluation.riskLevel === 'WARNING';
    if (filter === 'GENERIC') return r.evaluation.classification === 'GENERIC_EQUIVALENT';
    return true;
  });

  return (
    <div className="tab-content-container">
      <div className="section-hero">
        <div className="hero-text">
          <h2>Hospital & Pharmacy Inventory Batch Audit</h2>
          <p>
            Automated screening of procurement logs and dispensary inventory to detect duplicate stock,
            brand redundancy, and fatal Look-Alike Sound-Alike (LASA) dispensing hazards.
          </p>
        </div>
      </div>

      {/* Audit KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Audited Batch Pairs</span>
          <span className="kpi-value text-slate">{totalBatches}</span>
          <span className="kpi-caption">Screened hospital inventory logs</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Critical Alerts (LASA / Dups)</span>
          <span className="kpi-value text-danger">{criticalCount}</span>
          <span className="kpi-caption">Requires immediate dispensary warning</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Dosage / Formulation Warnings</span>
          <span className="kpi-value text-warning">{warningCount}</span>
          <span className="kpi-caption">Strength or delivery form mismatch</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">Generic Equivalents</span>
          <span className="kpi-value text-success">{genericCount}</span>
          <span className="kpi-caption">Opportunities for cost-saving substitution</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card filter-bar-card">
        <div className="filter-group">
          <Filter size={16} />
          <span>Filter Records:</span>
          <button
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All ({totalBatches})
          </button>
          <button
            className={`filter-btn ${filter === 'CRITICAL' ? 'active' : ''}`}
            onClick={() => setFilter('CRITICAL')}
          >
            Critical LASA & Duplicates ({criticalCount})
          </button>
          <button
            className={`filter-btn ${filter === 'WARNING' ? 'active' : ''}`}
            onClick={() => setFilter('WARNING')}
          >
            Warnings ({warningCount})
          </button>
          <button
            className={`filter-btn ${filter === 'GENERIC' ? 'active' : ''}`}
            onClick={() => setFilter('GENERIC')}
          >
            Generic Substitutes ({genericCount})
          </button>
        </div>
      </div>

      {/* Audit List */}
      <div className="audit-list">
        {filteredRecords.map((item, index) => {
          const evalData = item.evaluation;
          const scores = evalData.scores;

          return (
            <div key={index} className={`card audit-item-card risk-${evalData.riskLevel.toLowerCase()}`}>
              <div className="audit-card-top">
                <div className="audit-id-badge">
                  <strong>{item.batchId}</strong> • <span>{item.dept}</span>
                </div>
                <ClassificationBadge classification={evalData.classification} />
              </div>

              <div className="audit-card-body">
                <div className="pair-preview-row">
                  <div className="med-box">
                    <span className="med-box-label">Inventory Item 1</span>
                    <h4 className="med-box-name">{item.medA.name}</h4>
                    <span className="med-box-comp">{item.medA.composition}</span>
                    <span className="med-box-mfg">{item.medA.manufacturer}</span>
                  </div>

                  <div className="score-center-box">
                    <ScoreGauge score={scores.overallScore} size={64} label="Match" />
                  </div>

                  <div className="med-box">
                    <span className="med-box-label">Inventory Item 2</span>
                    <h4 className="med-box-name">{item.medB.name}</h4>
                    <span className="med-box-comp">{item.medB.composition}</span>
                    <span className="med-box-mfg">{item.medB.manufacturer}</span>
                  </div>
                </div>

                {/* Alerts */}
                {evalData.alerts.length > 0 && (
                  <div className="audit-alerts-list">
                    {evalData.alerts.map((alert, aIdx) => (
                      <AlertBanner key={aIdx} alert={alert} />
                    ))}
                  </div>
                )}
              </div>

              <div className="audit-card-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => onSelectForCompare(item.medA, item.medB)}
                >
                  <Eye size={14} />
                  Analyze in Pair Comparator
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
