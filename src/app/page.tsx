'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Portfolio } from '@/types/portfolio';
import { useAuth } from '@/contexts/AuthContext';
import SamplePortfolios from '@/components/SamplePortfolios';
import SavedPortfolios from '@/components/SavedPortfolios';
import CustomPortfolioInput from '@/components/portfolio/CustomPortfolioInput';
import AuthModal from '@/components/auth/AuthModal';
import { LogOut, User } from 'lucide-react';

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'portfolio';

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);

  const navigateToPortfolio = useCallback((portfolio: Portfolio) => {
    sessionStorage.setItem('risklens_current_portfolio', JSON.stringify(portfolio));
    router.push(`/portfolio/${toSlug(portfolio.name)}`);
  }, [router]);

  const handlePortfolioSelect = useCallback((portfolio: Portfolio) => {
    navigateToPortfolio(portfolio);
  }, [navigateToPortfolio]);

  const handleSavedPortfolioSelect = (saved: any) => {
    const portfolio: Portfolio = {
      name: saved.name,
      holdings: saved.holdings.map((h: any) => ({
        ticker: h.ticker,
        sector: h.sector,
        weight: h.weight,
        shares: h.shares,
        currentPrice: h.currentPrice,
      })),
      totalValue: saved.totalValue,
    };
    (portfolio as any).id = saved.id;
    navigateToPortfolio(portfolio);
  };

  const handleEditPortfolio = (portfolio: any) => {
    setEditingPortfolio(portfolio);
    setShowCustomInput(true);
  };

  const handleReset = () => {
    setShowCustomInput(false);
    setEditingPortfolio(null);
  };

  // ── Custom portfolio input ──
  if (showCustomInput) {
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

  // ── Landing page ──
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(102,126,234,0.45)', fontSize: '1rem' }}>
              📊
            </div>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '0.75rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: '600' }}>
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                style={{ padding: '0.45rem 0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.6)', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                style={{ padding: '0.45rem 1.1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.85)', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                Log in
              </button>
              <button
                onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                style={{ padding: '0.45rem 1.1rem', background: 'white', color: '#302b63', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Get started
              </button>
            </div>
          )}
        </nav>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', background: 'rgba(102,126,234,0.18)', border: '1px solid rgba(102,126,234,0.35)', borderRadius: '9999px', color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', fontWeight: '600', marginBottom: '2rem', letterSpacing: '0.03em' }}>
            <span style={{ color: '#a78bfa' }}>⚡</span>
            AI-Powered by Groq · Llama 3.3 70B
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.75rem)', fontWeight: '800', color: 'white', marginBottom: '1.5rem', lineHeight: '1.15', letterSpacing: '-0.03em' }}>
            Discover Hidden Risks in<br />
            <span style={{ background: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Your Portfolio
            </span>
          </h1>

          <p style={{ fontSize: '1.075rem', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', margin: '0 auto 2.75rem', lineHeight: '1.75' }}>
            Most investors think owning multiple stocks means diversification. Our AI reveals concentration risks before they cost you money.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[{ value: 'Llama 70B', label: 'AI Model' }, { value: '< 5 sec', label: 'Analysis Time' }, { value: '12+', label: 'Risk Factors' }].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {user && <SavedPortfolios onSelectPortfolio={handleSavedPortfolioSelect} onEditPortfolio={handleEditPortfolio} />}

        <div style={{ marginTop: user ? '4rem' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)', maxWidth: '100px' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {user ? 'Sample Portfolios' : 'Choose a Portfolio to Start'}
            </span>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)', maxWidth: '100px' }} />
          </div>
          <SamplePortfolios onSelect={handlePortfolioSelect} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingBottom: '3rem' }}>
          <button
            onClick={() => setShowCustomInput(true)}
            style={{ padding: '0.8rem 1.75rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', borderRadius: '0.875rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
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
