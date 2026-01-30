'use client';
import { RiskMetrics } from '@/types/portfolio';

export default function RiskSummary({ metrics }: { metrics: RiskMetrics }) {
  const riskConfig = {
    HIGH: { gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', label: 'HIGH RISK', icon: '⚠️' },
    MEDIUM: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', label: 'MEDIUM RISK', icon: '📊' },
    LOW: { gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', label: 'LOW RISK', icon: '🛡️' },
  };

  const config = riskConfig[metrics.riskLevel];
  const maxSector = Object.entries(metrics.sectorConcentration).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  );

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '1rem', 
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ background: config.gradient, padding: '1.5rem', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>{config.icon}</span>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.9 }}>{config.label}</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Risk Assessment</h3>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
          {metrics.riskLevel === 'HIGH' ? 'High concentration risk detected' :
           metrics.riskLevel === 'MEDIUM' ? 'Moderate concentration levels' :
           'Well diversified portfolio'}
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Diversification Score */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Diversification Score</span>
            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>
              {metrics.diversificationScore}
              <span style={{ fontSize: '1rem', color: '#9ca3af' }}>/100</span>
            </span>
          </div>
          <div style={{ width: '100%', height: '0.75rem', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{ 
                height: '100%', 
                background: config.gradient, 
                borderRadius: '9999px',
                width: `${metrics.diversificationScore}%`,
                transition: 'width 1s ease-out'
              }}
            />
          </div>
        </div>

        {/* Largest Concentration */}
        <div style={{ background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
            Largest Concentration
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>{maxSector[0]}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{maxSector[1].toFixed(1)}%</span>
          </div>
        </div>

        {/* Top 5 Holdings */}
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
            Top 5 Holdings
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {metrics.topHoldings.map((holding, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem', 
                  background: '#f9fafb', 
                  borderRadius: '0.5rem' 
                }}
              >
                <span style={{ fontWeight: '600', color: '#111827' }}>{holding.ticker}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                  {holding.weight?.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
