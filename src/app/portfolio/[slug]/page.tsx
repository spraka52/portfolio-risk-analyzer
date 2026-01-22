'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Portfolio } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioAPI } from '@/hooks/usePortfolioAPI';
import { useLivePrices } from '@/hooks/useLivePrices';
import SectorBreakdown from '@/components/SectorBreakdown';
import RiskSummary from '@/components/RiskSummary';
import AINarrative from '@/components/AINarrative';
import PortfolioAnalytics from '@/components/PortfolioAnalytics';
import PortfolioComparison from '@/components/PortfolioComparison';
import WhatIfSimulator from '@/components/WhatIfSimulator';
import CorrelationMatrix from '@/components/CorrelationMatrix';
import RebalancingSuggestions from '@/components/RebalancingSuggestions';
import NewsFeed from '@/components/NewsFeed';
import PortfolioHistory from '@/components/PortfolioHistory';
import AlertSettings, { loadAlertConfig, shouldTriggerAlert } from '@/components/AlertSettings';
import AuthModal from '@/components/auth/AuthModal';
import { Download, ArrowLeft } from 'lucide-react';
import { AnalysisSkeleton, ErrorMessage } from '@/components/ui/Skeleton';

function applyLivePrices(portfolio: Portfolio, prices: Record<string, number>): Portfolio {
  if (Object.keys(prices).length === 0) return portfolio;
  const updated = portfolio.holdings.map((h) => {
    const price = prices[h.ticker] ?? h.currentPrice ?? 0;
    const shares = h.shares ?? 0;
    return { ...h, currentPrice: price, value: shares * price };
  });
  const total = updated.reduce((sum, h) => sum + (h.value ?? 0), 0);
  return {
    ...portfolio,
    holdings: updated.map((h) => ({
      ...h,
      weight: total > 0 ? ((h.value ?? 0) / total) * 100 : h.weight ?? 0,
    })),
    totalValue: total,
  };
}

export default function PortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { savePortfolio, updatePortfolio, getPortfolios } = usePortfolioAPI();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePortfolio> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [alertToast, setAlertToast] = useState<string | null>(null);
  const [savedPortfoliosList, setSavedPortfoliosList] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Load portfolio from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('risklens_current_portfolio');
      if (!raw) { router.push('/'); return; }
      const p: Portfolio = JSON.parse(raw);
      setPortfolio(p);
      setAnalysis(analyzePortfolio(p));
      setAnalysisKey(1);
    } catch {
      setError('Could not load portfolio data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Saved portfolios for comparison
  useEffect(() => {
    if (!user) return;
    getPortfolios().then(setSavedPortfoliosList).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Live prices
  const { prices, lastUpdated, secondsAgo } = useLivePrices(portfolio);
  useEffect(() => {
    if (!portfolio || Object.keys(prices).length === 0) return;
    const refreshed = applyLivePrices(portfolio, prices);
    setPortfolio(refreshed);
    setAnalysis(analyzePortfolio(refreshed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  // Smart alert
  useEffect(() => {
    if (!analysis || !portfolio) return;
    const config = loadAlertConfig();
    if (!config || !shouldTriggerAlert(config, analysis.riskLevel)) return;
    const key = `alert_last_${portfolio.name}`;
    if (typeof window !== 'undefined' && localStorage.getItem(key) === analysis.riskLevel) return;
    const topSectorEntry = Object.entries(analysis.sectorConcentration).reduce(
      (max, e) => (e[1] > max[1] ? e : max), ['', 0]
    );
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: config.email,
        portfolioName: portfolio.name,
        riskLevel: analysis.riskLevel,
        threshold: config.threshold,
        diversificationScore: analysis.diversificationScore,
        topSector: `${topSectorEntry[0]} ${(topSectorEntry[1] as number).toFixed(1)}%`,
      }),
    }).then(r => {
      if (r.ok) {
        localStorage.setItem(key, analysis.riskLevel);
        setAlertToast(`Alert sent to ${config.email} — ${analysis.riskLevel} risk detected`);
        setTimeout(() => setAlertToast(null), 6000);
      }
    }).catch(() => {});
  }, [analysisKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!user) { setAuthMode('login'); setShowAuthModal(true); return; }
    if (!portfolio) return;
    setSaving(true);
    try {
      const data = {
        name: portfolio.name,
        holdings: portfolio.holdings.map((h) => ({
          ticker: h.ticker,
          companyName: h.ticker,
          sector: h.sector,
          shares: h.shares || Math.round((h.weight || 0) * 100),
          currentPrice: h.currentPrice || 0,
        })),
      };
      if ((portfolio as any).id) {
        await updatePortfolio((portfolio as any).id, data);
        alert('Portfolio updated!');
      } else {
        await savePortfolio(data);
        alert('Portfolio saved!');
      }
    } catch {
      alert('Failed to save portfolio.');
    } finally {
      setSaving(false);
    }
  };

  const topSectorEntry = analysis
    ? Object.entries(analysis.sectorConcentration).reduce((max, e) => (e[1] > max[1] ? e : max), ['', 0])
    : ['', 0];

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <AnalysisSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)', padding: '2rem 1rem 5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
          marginBottom: '1.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'white', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                {portfolio?.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
                  {portfolio?.holdings.length} holdings
                </span>
                {lastUpdated && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#10b981', fontWeight: '600' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Live · updated {secondsAgo}s ago
                  </span>
                )}
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {analysis && portfolio && (
                <AlertSettings
                  portfolioName={portfolio.name}
                  riskLevel={analysis.riskLevel}
                  diversificationScore={analysis.diversificationScore}
                  topSector={`${topSectorEntry[0]} ${(topSectorEntry[1] as number).toFixed(1)}%`}
                />
              )}
              <button
                onClick={() => window.print()}
                style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={14} /> PDF
              </button>
              {user && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: '0.55rem 1.1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Saving…' : (portfolio as any)?.id ? '💾 Update' : '💾 Save'}
                </button>
              )}
              <button
                onClick={() => router.push('/')}
                style={{ padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          </div>
        </div>

        {/* Alert toast */}
        {alertToast && (
          <div className="no-print" style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.75rem', color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
            🔔 {alertToast}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: '2rem' }}>
            <ErrorMessage message={error} onRetry={() => router.push('/')} />
          </div>
        )}

        {analysis && portfolio && (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <AINarrative key={analysisKey} portfolio={portfolio} metrics={analysis} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.75rem', marginBottom: '1.75rem' }}>
              <RiskSummary metrics={analysis} />
              <SectorBreakdown sectorConcentration={analysis.sectorConcentration} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <PortfolioHistory portfolio={portfolio} riskLevel={analysis.riskLevel} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <PortfolioAnalytics portfolio={portfolio} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <RebalancingSuggestions portfolio={portfolio} metrics={analysis} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <CorrelationMatrix portfolio={portfolio} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <NewsFeed portfolio={portfolio} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <WhatIfSimulator portfolio={portfolio} metrics={analysis} />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <PortfolioComparison portfolio={portfolio} metrics={analysis} savedPortfolios={savedPortfoliosList} />
            </div>
          </>
        )}
      </div>

      {showAuthModal && <AuthModal mode={authMode} onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}
