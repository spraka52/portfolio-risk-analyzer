'use client';
import { useState, useRef, useEffect } from 'react';
import { Portfolio, RiskMetrics } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import { FlaskConical, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WhatIfSimulatorProps {
  portfolio: Portfolio;
  metrics: RiskMetrics;
}

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

const RISK_ORDER: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const RISK_COLORS: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function WhatIfSimulator({ portfolio, metrics }: WhatIfSimulatorProps) {
  const [open, setOpen] = useState(false);

  // Ticker search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; name: string; price: number; sector: string } | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [shares, setShares] = useState('');
  const [result, setResult] = useState<{ portfolio: Portfolio; metrics: RiskMetrics } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1 || selectedStock) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedStock]);

  const selectStock = async (hit: SearchResult) => {
    setShowDropdown(false);
    setQuery(`${hit.ticker} — ${hit.name}`);
    setLoadingStock(true);
    setError('');
    try {
      const res = await fetch(`/api/stock?ticker=${hit.ticker}`);
      const data = await res.json();
      setSelectedStock({
        ticker: hit.ticker,
        name: hit.name,
        price: data.price ?? 0,
        sector: data.sector ?? 'Unknown',
      });
    } catch {
      setError('Could not fetch stock details. Try again.');
    } finally {
      setLoadingStock(false);
    }
  };

  const clearSelection = () => {
    setSelectedStock(null);
    setQuery('');
    setSuggestions([]);
    setResult(null);
    setError('');
  };

  const simulate = async () => {
    if (!selectedStock) { setError('Please select a stock first.'); return; }
    if (!shares || parseFloat(shares) <= 0) { setError('Enter a valid number of shares.'); return; }
    setError('');
    setLoading(true);

    const newShares = parseFloat(shares);
    const newValue = selectedStock.price * newShares;

    const simHolding = {
      ticker: selectedStock.ticker,
      shares: newShares,
      currentPrice: selectedStock.price,
      value: newValue,
      sector: selectedStock.sector,
    };

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
  const riskChange = result ? RISK_ORDER[result.metrics.riskLevel] - RISK_ORDER[metrics.riskLevel] : 0;

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
          onClick={() => { setOpen(!open); clearSelection(); setShares(''); }}
          style={{ padding: '0.5rem 1rem', background: open ? '#f3f4f6' : '#667eea', color: open ? '#374151' : 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {open ? 'Close' : 'Try it'}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'start', marginBottom: '0.75rem' }}>

            {/* Stock search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>
                Stock
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); if (selectedStock) clearSelection(); }}
                  placeholder="Search by name or ticker… e.g. Apple"
                  disabled={loadingStock}
                  style={{ width: '100%', padding: '0.5rem 2rem 0.5rem 0.75rem', border: `1px solid ${selectedStock ? '#10b981' : '#d1d5db'}`, borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', background: loadingStock ? '#f9fafb' : 'white' }}
                />
                {(searching || loadingStock) && (
                  <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#9ca3af' }}>…</span>
                )}
                {selectedStock && !loadingStock && (
                  <button onClick={clearSelection} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem', lineHeight: 1 }}>×</button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, marginTop: '2px', overflow: 'hidden' }}>
                  {suggestions.map(s => (
                    <button
                      key={s.ticker}
                      onMouseDown={() => selectStock(s)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.6rem 0.875rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <span>
                        <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#111827' }}>{s.ticker}</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem' }}>{s.name}</span>
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{s.exchange}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shares */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.3rem' }}>Shares</label>
              <input
                type="number" min="1" value={shares} onChange={e => setShares(e.target.value)}
                placeholder="e.g. 10"
                style={{ width: '110px', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          </div>

          {/* Auto-resolved stock info pill */}
          {selectedStock && (
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '9999px', fontSize: '0.78rem', color: '#166534', fontWeight: '600' }}>
                Price: ${selectedStock.price.toFixed(2)}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '9999px', fontSize: '0.78rem', color: '#1e40af', fontWeight: '600' }}>
                Sector: {selectedStock.sector}
              </span>
            </div>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>{error}</p>}

          <button
            onClick={simulate} disabled={loading || !selectedStock || !shares}
            style={{ padding: '0.625rem 1.5rem', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', fontSize: '0.875rem', cursor: (loading || !selectedStock || !shares) ? 'not-allowed' : 'pointer', opacity: (loading || !selectedStock || !shares) ? 0.5 : 1 }}
          >
            {loading ? 'Simulating…' : 'Run Simulation'}
          </button>

          {/* Results */}
          {result && selectedStock && (
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

                {/* Top sector */}
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
                Simulation adds <strong style={{ color: '#374151' }}>{selectedStock.ticker}</strong> ({shares} shares @ ${selectedStock.price.toFixed(2)}) to your current {portfolio.holdings.length} holdings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
