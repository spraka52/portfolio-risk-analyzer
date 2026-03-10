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
import AlertSettings, { loadAlertConfig, shouldTriggerAlert } from '@/components/AlertSettings';
import { LogOut, User } from 'lucide-react';

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
    setSelectedPortfolio(portfolio);
    const metrics = analyzePortfolio(portfolio);
    setAnalysis(metrics);
    setShowCustomInput(false);
    setAnalysisKey((k) => k + 1);
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: 'white' }}>
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                  Login
                </button>
                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} style={{ padding: '0.5rem 1.5rem', background: 'white', color: '#667eea', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              ⚡ AI-Powered by Groq · Llama 3.3 70B
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              Discover Hidden Risks in<br />
              <span style={{ color: '#fbbf24' }}>Your Portfolio</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto 3rem' }}>
              Most investors think owning multiple stocks means diversification. Our AI reveals concentration risks before they cost you money.
            </p>
          </div>

          {user && <SavedPortfolios onSelectPortfolio={handleSavedPortfolioSelect} onEditPortfolio={handleEditPortfolio} />}

          <div style={{ marginTop: user ? '3rem' : '0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
              {user ? 'Try Sample Portfolios' : 'Choose a Sample Portfolio'}
            </h2>
            <SamplePortfolios onSelect={handlePortfolioSelect} />
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              onClick={() => setShowCustomInput(true)}
              style={{ padding: '1rem 2rem', background: 'white', color: '#667eea', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              ✏️ Create Custom Portfolio
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 1rem' }}>
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

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Alert settings */}
              {analysis && (
                <AlertSettings
                  portfolioName={selectedPortfolio.name}
                  riskLevel={analysis.riskLevel}
                  diversificationScore={analysis.diversificationScore}
                  topSector={`${topSectorEntry[0]} ${(topSectorEntry[1] as number).toFixed(1)}%`}
                />
              )}

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

        {analysis && (
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

            {/* ── Historical Performance + Advanced Metrics ── */}
            <div style={{ marginBottom: '2rem' }}>
              <PortfolioAnalytics portfolio={selectedPortfolio} />
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
