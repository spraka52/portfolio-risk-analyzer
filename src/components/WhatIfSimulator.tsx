'use client';
import { useState } from 'react';
import { Portfolio, RiskMetrics } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import { FlaskConical, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WhatIfSimulatorProps {
  portfolio: Portfolio;
  metrics: RiskMetrics;
}

const RISK_ORDER: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const RISK_COLORS: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function WhatIfSimulator({ portfolio, metrics }: WhatIfSimulatorProps) {
  const [open, setOpen] = useState(false);
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [sector, setSector] = useState('Technology');
  const [result, setResult] = useState<{ portfolio: Portfolio; metrics: RiskMetrics } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SECTORS = ['Technology', 'Healthcare', 'Financials', 'Consumer Discretionary', 'Industrials', 'Energy', 'Utilities', 'Real Estate', 'Materials', 'Communication Services', 'Consumer Staples'];

  const simulate = async () => {
    if (!ticker.trim() || !shares || !price) {
      setError('Fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    // Try to fetch real price from Finnhub
    let resolvedPrice = parseFloat(price);
    let resolvedSector = sector;
    try {
      const res = await fetch(`/api/stock/${ticker.toUpperCase().trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.currentPrice) resolvedPrice = data.currentPrice;
        if (data.sector) resolvedSector = data.sector;
      }
    } catch { /* use manual values */ }

    const newShares = parseFloat(shares);
    const newValue = resolvedPrice * newShares;

    const simHolding = {
      ticker: ticker.toUpperCase().trim(),
      shares: newShares,
      currentPrice: resolvedPrice,
      value: newValue,
      sector: resolvedSector,
    };

    // Recalculate weights for all holdings + new one
    const allHoldings = [...portfolio.holdings, simHolding];
    const total = allHoldings.reduce((s, h) => s + (h.value ?? (h.currentPrice ?? 0) * (h.shares ?? 0)), 0);
    const withWeights = allHoldings.map(h => ({
      ...h,
      value: h.value ?? (h.currentPrice ?? 0) * (h.shares ?? 0),
      weight: ((h.value ?? (h.currentPrice ?? 0) * (h.shares ?? 0)) / total) * 100,
    }));

    const simPortfolio: Portfolio = { ...portfolio, holdings: withWeights, totalValue: total };
    const simMetrics = analyzePortfolio(simPortfolio);
    setResult({ portfolio: simPortfolio, metrics: simMetrics });
    setLoading(false);
  };

  const scoreDelta = result ? result.metrics.diversificationScore - metrics.diversificationScore : 0;
  const riskChange = result
    ? RISK_ORDER[result.metrics.riskLevel] - RISK_ORDER[metrics.riskLevel]
    : 0;

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={18} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>What-If Simulator</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>See how adding a holding changes your risk</p>
          </div>
        </div>
        <button
          onClick={() => { setOpen(!open); setResult(null); setError(''); }}
          style={{ padding: '0.5rem 1rem', background: open ? '#f3f4f6' : '#667eea', color: open ? '#374151' : 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {open ? 'Close' : 'Try it'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '1.5rem' }}>
          {/* Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Ticker</label>
              <input
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. NVDA"
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Shares</label>
              <input
                type="number" min="1" value={shares} onChange={e => setShares(e.target.value)}
                placeholder="e.g. 10"
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Price ($)</label>
              <input
                type="number" min="0.01" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 120.00"
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Sector</label>
              <select
                value={sector} onChange={e => setSector(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', background: 'white' }}
              >
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>{error}</p>}

          <button
            onClick={simulate} disabled={loading}
            style={{ padding: '0.625rem 1.5rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>

          {/* Results */}
          {result && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Diversification score */}
                <div style={{ background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', borderLeft: `4px solid ${scoreDelta >= 0 ? '#10b981' : '#ef4444'}` }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Diversification Score</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{result.metrics.diversificationScore}</span>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>/ 100</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: scoreDelta >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {scoreDelta > 0 ? <TrendingUp size={14} /> : scoreDelta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                      {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>was {metrics.diversificationScore}</div>
                </div>

                {/* Risk level */}
                <div style={{ background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', borderLeft: `4px solid ${RISK_COLORS[result.metrics.riskLevel]}` }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Risk Level</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ padding: '0.3rem 0.8rem', background: RISK_COLORS[result.metrics.riskLevel], color: 'white', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700' }}>
                      {result.metrics.riskLevel}
                    </span>
                    {riskChange !== 0 && (
                      <span style={{ fontSize: '0.8rem', color: riskChange > 0 ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                        {riskChange > 0 ? '▲ increased' : '▼ improved'}
                      </span>
                    )}
                    {riskChange === 0 && <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>unchanged</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>was {metrics.riskLevel}</div>
                </div>

                {/* Top sector shift */}
                <div style={{ background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', borderLeft: '4px solid #667eea' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Top Concentration</div>
                  {Object.entries(result.metrics.sectorConcentration)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 1)
                    .map(([s, v]) => (
                      <div key={s}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>{(v as number).toFixed(1)}%</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{s}</div>
                      </div>
                    ))}
                </div>
              </div>

              <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
                Simulation adds <strong style={{ color: '#374151' }}>{ticker}</strong> ({shares} shares @ ${price}) to your current {portfolio.holdings.length} holdings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
