'use client';
import { useState } from 'react';
import { Portfolio, RiskMetrics } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import { SAMPLE_PORTFOLIOS } from '@/lib/sampleData';

interface ComparisonColumnProps {
  label: string;
  portfolio: Portfolio;
  metrics: RiskMetrics;
  highlight?: boolean;
}

const RISK_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

function SectorBar({ sector, value, max }: { sector: string; value: number; max: number }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
        <span style={{ color: '#374151', fontWeight: '500' }}>{sector}</span>
        <span style={{ color: '#6b7280' }}>{value.toFixed(1)}%</span>
      </div>
      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(value / max) * 100}%`,
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '9999px',
          }}
        />
      </div>
    </div>
  );
}

function ComparisonColumn({ label, portfolio, metrics, highlight }: ComparisonColumnProps) {
  const maxSector = Math.max(...Object.values(metrics.sectorConcentration));
  const sortedSectors = Object.entries(metrics.sectorConcentration).sort(([, a], [, b]) => b - a);

  return (
    <div
      style={{
        flex: 1,
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: highlight ? '2px solid #667eea' : '1px solid #e5e7eb',
        minWidth: 0,
      }}
    >
      {highlight && (
        <div
          style={{
            background: '#eff6ff',
            color: '#667eea',
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '0.5rem',
          }}
        >
          CURRENT
        </div>
      )}
      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '1.25rem' }}>
        {label}
      </h4>

      {/* Risk badge */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span
          style={{
            background: RISK_COLORS[metrics.riskLevel],
            color: 'white',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '700',
          }}
        >
          {metrics.riskLevel} RISK
        </span>
      </div>

      {/* Diversification Score */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
          Diversification Score
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>
          {metrics.diversificationScore}
          <span style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: '600' }}>/100</span>
        </div>
        <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden', marginTop: '0.5rem' }}>
          <div
            style={{
              height: '100%',
              width: `${metrics.diversificationScore}%`,
              background:
                metrics.diversificationScore > 60
                  ? '#10b981'
                  : metrics.diversificationScore > 40
                  ? '#f59e0b'
                  : '#ef4444',
              borderRadius: '9999px',
            }}
          />
        </div>
      </div>

      {/* Holdings count */}
      <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
        {portfolio.holdings.length} holdings &middot; {Object.keys(metrics.sectorConcentration).length} sectors
      </div>

      {/* Sector Breakdown */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
          SECTOR ALLOCATION
        </div>
        {sortedSectors.map(([sector, value]) => (
          <SectorBar key={sector} sector={sector} value={value} max={maxSector} />
        ))}
      </div>
    </div>
  );
}

interface PortfolioComparisonProps {
  portfolio: Portfolio;
  metrics: RiskMetrics;
}

export default function PortfolioComparison({ portfolio, metrics }: PortfolioComparisonProps) {
  const [open, setOpen] = useState(false);
  const [comparePortfolio, setComparePortfolio] = useState<Portfolio | null>(null);
  const [compareMetrics, setCompareMetrics] = useState<RiskMetrics | null>(null);

  const handleSelect = (sample: Portfolio) => {
    setComparePortfolio(sample);
    setCompareMetrics(analyzePortfolio(sample));
    setOpen(false);
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: comparePortfolio ? '1.5rem' : '0',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
          Portfolio Comparison
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {comparePortfolio && (
            <button
              onClick={() => { setComparePortfolio(null); setCompareMetrics(null); }}
              style={{
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setOpen(true)}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {comparePortfolio ? 'Change Comparison' : 'Compare with...'}
          </button>
        </div>
      </div>

      {!comparePortfolio && (
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          Select a portfolio to compare side-by-side against your current analysis.
        </p>
      )}

      {comparePortfolio && compareMetrics && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <ComparisonColumn
            label={portfolio.name}
            portfolio={portfolio}
            metrics={metrics}
            highlight
          />
          <ComparisonColumn
            label={comparePortfolio.name}
            portfolio={comparePortfolio}
            metrics={compareMetrics}
          />
        </div>
      )}

      {/* Portfolio Picker Modal */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Choose a Portfolio to Compare
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9ca3af' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SAMPLE_PORTFOLIOS.map((sample) => {
                const m = analyzePortfolio(sample);
                return (
                  <button
                    key={sample.name}
                    onClick={() => handleSelect(sample)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem' }}>{sample.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        {sample.holdings.length} holdings &middot; Score {m.diversificationScore}/100
                      </div>
                    </div>
                    <span
                      style={{
                        background: RISK_COLORS[m.riskLevel],
                        color: 'white',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                      }}
                    >
                      {m.riskLevel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
