import React, { useState } from 'react';
import { Database, Plus, Search, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import AddMedicineModal from './AddMedicineModal';

export default function FormularyTab({ medicines, onAddMedicine, onCheckDuplicateFor }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMedicines = medicines.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.composition || '').toLowerCase().includes(q) ||
      (m.manufacturer || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="tab-content-container">
      <div className="section-hero">
        <div className="hero-text">
          <h2>Registered Formulary & Drug Catalog</h2>
          <p>
            Standardized repository of medicines with verified active chemical compositions,
            therapeutic classes, dosage forms, and manufacturer signatures.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} /> Register New Medicine
        </button>
      </div>

      {/* Search & Counter Bar */}
      <div className="card catalog-search-card">
        <div className="input-with-icon">
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="text-input"
            placeholder="Search by brand name, active salt, category, or manufacturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="catalog-count-pill">
          Showing <strong>{filteredMedicines.length}</strong> of {medicines.length} registered drugs
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="formulary-grid">
        {filteredMedicines.map((med) => (
          <div key={med.id} className="card drug-card">
            <div className="drug-card-top">
              <div className="drug-title-group">
                <h4 className="drug-name">{med.name}</h4>
                <span className="drug-category-tag">{med.category || 'Therapeutic Agent'}</span>
              </div>
              <span className="drug-form-pill">{med.dosageForm}</span>
            </div>

            <div className="drug-composition-box">
              <span className="box-label">Verified Active Composition:</span>
              <p className="comp-text">{med.composition}</p>
            </div>

            <div className="drug-meta-row">
              <div className="meta-item">
                <span className="label">Strength:</span>
                <span className="val">{med.strength || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Brand:</span>
                <span className="val">{med.brandName || '—'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Manufacturer:</span>
                <span className="val">{med.manufacturer || '—'}</span>
              </div>
            </div>

            <div className="drug-card-actions">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => onCheckDuplicateFor(med)}
              >
                Scan for Duplicates <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddMedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMedicine={onAddMedicine}
      />
    </div>
  );
}
