import React from 'react';
import { Pill, Activity, ShieldCheck, Database, RefreshCw, GitCompare, Search, ShieldAlert } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus, onRefreshBackend }) {
  return (
    <header className="navbar-container">
      <div className="navbar-top">
        <div className="brand-group">
          <div className="brand-icon-box">
            <Pill className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">MediMatch<span className="brand-highlight">AI</span></span>
              <span className="project-tag">College Project</span>
            </div>
            <p className="brand-subtitle">
              Intelligent Duplicate Medicine Detection & Safety Alert Engine
            </p>
          </div>
        </div>

        <div className="navbar-meta">
          <div className={`backend-indicator ${backendStatus.online ? 'status-online' : 'status-offline'}`}>
            <span className="status-dot"></span>
            <span className="status-label">
              {backendStatus.online ? 'Spring Boot 3 (Port 8080)' : 'Client-Side NLP Engine'}
            </span>
            <button
              onClick={onRefreshBackend}
              className="refresh-btn"
              title="Ping Spring Boot Backend"
              disabled={backendStatus.checking}
            >
              <RefreshCw size={12} className={backendStatus.checking ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <nav className="nav-tabs-bar">
        <button
          className={`nav-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={16} />
          <span>Duplicate Search</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          <GitCompare size={16} />
          <span>Pair Comparator</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <ShieldAlert size={16} />
          <span>Hospital Audit Batches</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'formulary' ? 'active' : ''}`}
          onClick={() => setActiveTab('formulary')}
        >
          <Database size={16} />
          <span>Formulary Database</span>
        </button>
      </nav>
    </header>
  );
}
