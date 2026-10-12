import React from 'react';

export default function ScoreGauge({ score = 0, size = 68, label = 'Match', subtext = '' }) {
  const radius = size * 0.38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // emerald-500
    if (s >= 55) return '#f59e0b'; // amber-500
    if (s >= 30) return '#6366f1'; // indigo-500
    return '#64748b'; // slate-500
  };

  const strokeColor = getColor(score);

  return (
    <div className="score-gauge-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={size * 0.1}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={size * 0.1}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: size * 0.28, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {score}%
          </span>
        </div>
      </div>
      {label && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>
          {label}
        </span>
      )}
      {subtext && (
        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{subtext}</span>
      )}
    </div>
  );
}
