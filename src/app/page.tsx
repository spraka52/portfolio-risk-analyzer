'use client';
import { useState, useEffect, useCallback } from 'react';
import { Portfolio } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioAPI } from '@/hooks/usePortfolioAPI';
import { useLivePrices } from '@/hooks/useLivePrices';
import SamplePortfolios from '@/components/SamplePortfolios';
import SavedPortfolios from '@/components/SavedPortfolios';
import CustomPortfolioInput from '@/components/portfolio/CustomPortfolioInput';
import SectorBreakdown from '@/components/SectorBreakdown';
import RiskSummary from '@/components/RiskSummary';
import AINarrative from '@/components/AINarrative';
import AuthModal from '@/components/auth/AuthModal';
import PortfolioAnalytics from '@/components/PortfolioAnalytics';
import PortfolioComparison from '@/components/PortfolioComparison';
import WhatIfSimulator from '@/components/WhatIfSimulator';
import CorrelationMatrix from '@/components/CorrelationMatrix';
import RebalancingSuggestions from '@/components/RebalancingSuggestions';
import NewsFeed from '@/components/NewsFeed';
import PortfolioHistory from '@/components/PortfolioHistory';
import AlertSettings, { loadAlertConfig, shouldTriggerAlert } from '@/components/AlertSettings';
import { LogOut, User, Download } from 'lucide-react';
import { AnalysisSkeleton, ErrorMessage } from '@/components/ui/Skeleton';

/** Rebuild portfolio with live prices and recalculate weights */
function applyLivePrices(portfolio: Portfolio, prices: Record<string, number>): Portfolio {
  if (Object.keys(prices).length === 0) return portfolio;

  const updated = portfolio.holdings.map((h) => {
    const price = prices[h.ticker] ?? h.currentPrice ?? 0;
    const shares = h.shares ?? 0;
    return { ...h, currentPrice: price, value: shares * price };
  });

  const total = updated.reduce((sum, h) => sum + (h.value ?? 0), 0);

  const withWeights = updated.map((h) => ({
    ...h,
    weight: total > 0 ? ((h.value ?? 0) / total) * 100 : h.weight ?? 0,
  }));

  return { ...portfolio, holdings: withWeights, totalValue: total };
}

export default function Home() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePortfolio> | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [saving, setSaving] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  // analysisKey increments each time the user triggers a fresh analysis → remounts AINarrative
  const [analysisKey, setAnalysisKey] = useState(0);

  const { user, logout } = useAuth();
  const { savePortfolio, updatePortfolio } = usePortfolioAPI();

  // Live price polling
  const { prices, lastUpdated, secondsAgo } = useLivePrices(selectedPortfolio);

  // Update metrics when live prices arrive
  useEffect(() => {
    if (!selectedPortfolio || Object.keys(prices).length === 0) return;
    const refreshed = applyLivePrices(selectedPortfolio, prices);
    setSelectedPortfolio(refreshed);
    setAnalysis(analyzePortfolio(refreshed));
  // We intentionally only react to price changes, not portfolio reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  // Check alert rules after each analysis
  useEffect(() => {
    if (!analysis || !selectedPortfolio) return;
    const config = loadAlertConfig();
    if (!config || !shouldTriggerAlert(config, analysis.riskLevel)) return;

    const topSectorEntry = Object.entries(analysis.sectorConcentration).reduce(
      (max, e) => (e[1] > max[1] ? e : max),
      ['', 0]
    );

    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.email,
        portfolioName: selectedPortfolio.name,
        riskLevel: analysis.riskLevel,
        threshold: config.threshold,
        diversificationScore: analysis.diversificationScore,
        topSector: `${topSectorEntry[0]} ${(topSectorEntry[1] as number).toFixed(1)}%`,
      }),
    }).catch(() => {});
  }, [analysisKey]); // Only trigger on fresh analysis, not on live price ticks

  const handlePortfolioSelect = useCallback((portfolio: Portfolio) => {
    setAnalysisError(null);
    setAnalysisLoading(true);
    setSelectedPortfolio(portfolio);
    setShowCustomInput(false);
    try {
      const metrics = analyzePortfolio(portfolio);
      setAnalysis(metrics);
      setAnalysisKey((k) => k + 1);
    } catch {
      setAnalysisError('Failed to analyze portfolio. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  }, []);

  const handleSavedPortfolioSelect = (savedPortfolio: any) => {
    const portfolio: Portfolio = {
      name: savedPortfolio.name,
      holdings: savedPortfolio.holdings.map((h: any) => ({
        ticker: h.ticker,
        sector: h.sector,
        weight: h.weight,
        shares: h.shares,
        currentPrice: h.currentPrice,
      })),
      totalValue: savedPortfolio.totalValue,
    };
    (portfolio as any).id = savedPortfolio.id;
    handlePortfolioSelect(portfolio);
  };

  const handleEditPortfolio = (portfolio: any) => {
    setEditingPortfolio(portfolio);
    setShowCustomInput(true);
  };

  const handleSavePortfolio = async () => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!selectedPortfolio) return;

    setSaving(true);
    try {
      const portfolioData = {
        name: selectedPortfolio.name,
        holdings: selectedPortfolio.holdings.map((h) => ({
          ticker: h.ticker,
          companyName: h.ticker,
          sector: h.sector,
          shares: h.shares || Math.round((h.weight || 0) * 100),
          currentPrice: h.currentPrice || 0,
        })),
      };

      if ((selectedPortfolio as any).id) {
        await updatePortfolio((selectedPortfolio as any).id, portfolioData);
        alert('Portfolio updated successfully!');
      } else {
        await savePortfolio(portfolioData);
        alert('Portfolio saved successfully!');
      }
      setEditingPortfolio(null);
    } catch {
      alert('Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedPortfolio(null);
    setAnalysis(null);
    setShowCustomInput(false);
    setEditingPortfolio(null);
  };

  // ─── Landing page ────────────────────────────────────────────────────────────
  if (!selectedPortfolio && !showCustomInput) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)', padding: '1.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* ── Nav ── */}
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4.5rem' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(102,126,234,0.45)',
                fontSize: '1rem',
              }}>📊</div>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.025em' }}>
                RiskLens
              </span>
            </div>

            {/* Auth controls */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.45rem 0.9rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '0.75rem', color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.85rem', fontWeight: '600',
                }}>
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    padding: '0.45rem 0.9rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.6)', borderRadius: '0.75rem',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                  style={{
                    padding: '0.45rem 1.1rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    color: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem',
                    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  Log in
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                  style={{
                    padding: '0.45rem 1.1rem',
                    background: 'white', color: '#302b63',
                    border: 'none', borderRadius: '0.75rem',
                    cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Get started
                </button>
              </div>
            )}
          </nav>

          {/* ── Hero ── */}
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 1rem',
              background: 'rgba(102,126,234,0.18)',
              border: '1px solid rgba(102,126,234,0.35)',
              borderRadius: '9999px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.78rem', fontWeight: '600', marginBottom: '2rem',
              letterSpacing: '0.03em',
            }}>
              <span style={{ color: '#a78bfa' }}>⚡</span>
              AI-Powered by Groq · Llama 3.3 70B
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 3.75rem)',
              fontWeight: '800', color: 'white',
              marginBottom: '1.5rem',
              lineHeight: '1.15', letterSpacing: '-0.03em',
            }}>
              Discover Hidden Risks in<br />
              <span style={{
                background: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Your Portfolio
              </span>
            </h1>

            <p style={{
              fontSize: '1.075rem', color: 'rgba(255,255,255,0.55)',
              maxWidth: '560px', margin: '0 auto 2.75rem',
              lineHeight: '1.75',
            }}>
              Most investors think owning multiple stocks means diversification. Our AI reveals concentration risks before they cost you money.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                { value: 'Llama 70B', label: 'AI Model' },
                { value: '< 5 sec', label: 'Analysis Time' },
                { value: '12+', label: 'Risk Factors' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {user && <SavedPortfolios onSelectPortfolio={handleSavedPortfolioSelect} onEditPortfolio={handleEditPortfolio} />}

          <div style={{ marginTop: user ? '4rem' : '0' }}>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)', maxWidth: '100px' }} />
              <span style={{
                fontSize: '0.72rem', fontWeight: '700',
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>
                {user ? 'Sample Portfolios' : 'Choose a Portfolio to Start'}
              </span>
              <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)', maxWidth: '100px' }} />
            </div>
            <SamplePortfolios onSelect={handlePortfolioSelect} />
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingBottom: '3rem' }}>
            <button
              onClick={() => setShowCustomInput(true)}
              style={{
                padding: '0.8rem 1.75rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.85)', borderRadius: '0.875rem',
                fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >
              ✏️ Build Custom Portfolio
            </button>
          </div>
        </div>

        {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // ─── Custom portfolio input form ─────────────────────────────────────────────
  if (showCustomInput && !selectedPortfolio) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <CustomPortfolioInput
            onAnalyze={handlePortfolioSelect}
            onCancel={handleReset}
            existingPortfolio={editingPortfolio}
          />
        </div>
      </div>
    );
  }

  if (!selectedPortfolio) return null;

  // ─── Analysis results ─────────────────────────────────────────────────────────
  const topSectorEntry = analysis
    ? Object.entries(analysis.sectorConcentration).reduce(
        (max, e) => (e[1] > max[1] ? e : max),
        ['', 0]
      )
    : ['', 0];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ── Header bar ── */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem 2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                {selectedPortfolio.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {selectedPortfolio.holdings.length} holdings
                </span>
                {/* Live price indicator */}
                {lastUpdated && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Live · updated {secondsAgo}s ago
                  </span>
                )}
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Alert settings */}
              {analysis && (
                <AlertSettings
                  portfolioName={selectedPortfolio.name}
                  riskLevel={analysis.riskLevel}
                  diversificationScore={analysis.diversificationScore}
                  topSector={`${topSectorEntry[0]} ${(topSectorEntry[1] as number).toFixed(1)}%`}
                />
              )}

              {/* Export PDF */}
              <button
                onClick={() => window.print()}
                style={{ padding: '0.625rem 1.25rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="Export as PDF"
              >
                <Download size={15} />
                PDF
              </button>

              {user && (
                <button
                  onClick={handleSavePortfolio}
                  disabled={saving}
                  style={{ padding: '0.625rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving...' : (selectedPortfolio as any).id ? '💾 Update' : '💾 Save'}
                </button>
              )}
              <button
                onClick={handleReset}
                style={{ padding: '0.625rem 1.25rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {analysisError && (
          <div style={{ marginBottom: '2rem' }}>
            <ErrorMessage message={analysisError} onRetry={() => handlePortfolioSelect(selectedPortfolio)} />
          </div>
        )}

        {analysisLoading && (
          <div style={{ marginBottom: '2rem' }}>
            <AnalysisSkeleton />
          </div>
        )}

        {!analysisLoading && !analysisError && analysis && (
          <>
            {/* ── AI Narrative ── */}
            <div style={{ marginBottom: '2rem' }}>
              <AINarrative key={analysisKey} portfolio={selectedPortfolio} metrics={analysis} />
            </div>

            {/* ── Risk Summary + Sector Breakdown ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <RiskSummary metrics={analysis} />
              <SectorBreakdown sectorConcentration={analysis.sectorConcentration} />
            </div>

            {/* ── Portfolio Value History (localStorage snapshots) ── */}
            <div style={{ marginBottom: '2rem' }}>
              <PortfolioHistory portfolio={selectedPortfolio} riskLevel={analysis.riskLevel} />
            </div>

            {/* ── Historical Performance + Advanced Metrics ── */}
            <div style={{ marginBottom: '2rem' }}>
              <PortfolioAnalytics portfolio={selectedPortfolio} />
            </div>

            {/* ── Rebalancing Suggestions ── */}
            <div style={{ marginBottom: '2rem' }}>
              <RebalancingSuggestions portfolio={selectedPortfolio} metrics={analysis} />
            </div>

            {/* ── Correlation Matrix ── */}
            <div style={{ marginBottom: '2rem' }}>
              <CorrelationMatrix portfolio={selectedPortfolio} />
            </div>

            {/* ── News Feed ── */}
            <div style={{ marginBottom: '2rem' }}>
              <NewsFeed portfolio={selectedPortfolio} />
            </div>

            {/* ── What-If Simulator ── */}
            <div style={{ marginBottom: '2rem' }}>
              <WhatIfSimulator portfolio={selectedPortfolio} metrics={analysis} />
            </div>

            {/* ── Portfolio Comparison ── */}
            <div style={{ marginBottom: '2rem' }}>
              <PortfolioComparison portfolio={selectedPortfolio} metrics={analysis} />
            </div>
          </>
        )}
      </div>

      {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
