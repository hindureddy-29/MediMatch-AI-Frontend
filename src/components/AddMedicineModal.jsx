import React, { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';

export default function AddMedicineModal({ isOpen, onClose, onAddMedicine }) {
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    genericName: '',
    composition: '',
    dosageForm: 'tablet',
    strength: '',
    manufacturer: '',
    category: '',
    price: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.composition.trim()) return;

    onAddMedicine({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : 0.0,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Register New Medicine in Formulary</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Full Medicine Formulation Name <span className="req">*</span></label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Paracip 500 Tablet"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Active Ingredients / Salt Composition <span className="req">*</span></label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Paracetamol 500mg"
              value={formData.composition}
              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
              required
            />
          </div>

          <div className="input-row-2">
            <div className="form-group">
              <label>Brand Name</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Paracip"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Generic Name</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Paracetamol"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              />
            </div>
          </div>

          <div className="input-row-2">
            <div className="form-group">
              <label>Dosage Form</label>
              <select
                className="text-input"
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
              >
                <option value="tablet">Tablet</option>
                <option value="capsule">Capsule</option>
                <option value="syrup">Syrup</option>
                <option value="suspension">Suspension</option>
                <option value="injection">Injection</option>
                <option value="drops">Drops</option>
                <option value="ointment">Ointment</option>
              </select>
            </div>

            <div className="form-group">
              <label>Strength / Unit</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. 500mg"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              />
            </div>
          </div>

          <div className="input-row-2">
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Cipla Ltd"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Therapeutic Category</label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Analgesics"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
