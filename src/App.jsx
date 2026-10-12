import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SingleSearchTab from './components/SingleSearchTab';
import PairCompareTab from './components/PairCompareTab';
import BatchAuditTab from './components/BatchAuditTab';
import FormularyTab from './components/FormularyTab';
import {
  checkBackendHealth,
  getMedicines,
  addMedicine,
  searchDuplicates,
  compareMedicines,
} from './services/apiService';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: false });
  const [medicines, setMedicines] = useState([]);
  const [comparePair, setComparePair] = useState(null);

  // Check backend health and load initial medicine formulary
  const refreshBackendStatus = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const health = await checkBackendHealth();
    setBackendStatus({ online: health.online, checking: false });

    const medRes = await getMedicines();
    setMedicines(medRes.data);
  };

  useEffect(() => {
    refreshBackendStatus();
  }, []);

  // Handlers
  const handleSearch = async (queryObj, threshold) => {
    return await searchDuplicates(queryObj, threshold);
  };

  const handleRunCompare = async (medA, medB) => {
    return await compareMedicines(medA, medB);
  };

  const handleAddMedicine = async (newMed) => {
    const res = await addMedicine(newMed);
    if (res && res.data) {
      setMedicines((prev) => [res.data, ...prev]);
    }
  };

  const handleSelectForCompare = (itemA, itemB) => {
    setComparePair({ medA: itemA, medB: itemB });
    setActiveTab('compare');
  };

  const handleCheckDuplicateFor = (med) => {
    setActiveTab('search');
  };

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onRefreshBackend={refreshBackendStatus}
      />

      <main className="main-content">
        {activeTab === 'search' && (
          <SingleSearchTab
            onSearch={handleSearch}
            onSelectForCompare={handleSelectForCompare}
          />
        )}

        {activeTab === 'compare' && (
          <PairCompareTab
            comparePair={comparePair}
            onRunCompare={handleRunCompare}
          />
        )}

        {activeTab === 'audit' && (
          <BatchAuditTab
            onSelectForCompare={handleSelectForCompare}
          />
        )}

        {activeTab === 'formulary' && (
          <FormularyTab
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
            onCheckDuplicateFor={handleCheckDuplicateFor}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <strong>MediMatch AI</strong> — Duplicate Medicine Detection & Uncertainty Alert System
          </div>
          <div className="footer-right">
            <span>Stack: React + Vite • Spring Boot 21 • PostgreSQL</span>
            <span className="dot-sep">•</span>
            <span>Academic Project Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
