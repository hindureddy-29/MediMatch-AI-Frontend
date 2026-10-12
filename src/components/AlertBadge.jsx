import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, HelpCircle } from 'lucide-react';

export function ClassificationBadge({ classification }) {
  switch (classification) {
    case 'EXACT_DUPLICATE':
      return (
        <span className="badge badge-danger">
          <AlertOctagon size={14} /> Duplicate Entry
        </span>
      );
    case 'GENERIC_EQUIVALENT':
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={14} /> Generic Equivalent
        </span>
      );
    case 'PARTIAL_MATCH':
      return (
        <span className="badge badge-warning">
          <AlertTriangle size={14} /> Partial Match
        </span>
      );
    case 'LASA_ALERT':
      return (
        <span className="badge badge-lasa">
          <AlertTriangle size={14} /> LASA Risk (Look-Alike)
        </span>
      );
    case 'UNVERIFIED_SUSPECTED_DUPLICATE':
      return (
        <span className="badge badge-uncertain">
          <HelpCircle size={14} /> Unverified Suspect
        </span>
      );
    default:
      return (
        <span className="badge badge-neutral">
          <Info size={14} /> Distinct Medicine
        </span>
      );
  }
}

export function AlertBanner({ alert }) {
  const isDanger = alert.type === 'danger';
  const isWarning = alert.type === 'warning';
  const isInfo = alert.type === 'info';

  const icon = isDanger ? (
    <AlertOctagon size={18} className="alert-icon text-danger" />
  ) : isWarning ? (
    <AlertTriangle size={18} className="alert-icon text-warning" />
  ) : (
    <Info size={18} className="alert-icon text-info" />
  );

  return (
    <div className={`alert-banner-box alert-${alert.type}`}>
      <div className="alert-banner-header">
        {icon}
        <strong className="alert-code">[{alert.code}]</strong>
      </div>
      <p className="alert-msg">{alert.message}</p>
    </div>
  );
}
