'use client';
import { useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolioAPI } from '@/hooks/usePortfolioAPI';
import SamplePortfolios from '@/components/SamplePortfolios';
import SavedPortfolios from '@/components/SavedPortfolios';
import CustomPortfolioInput from '@/components/portfolio/CustomPortfolioInput';
import SectorBreakdown from '@/components/SectorBreakdown';
import RiskSummary from '@/components/RiskSummary';
import AINarrative from '@/components/AINarrative';
import AuthModal from '@/components/auth/AuthModal';
import { LogOut, User } from 'lucide-react';

export default function Home() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePortfolio> | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [saving, setSaving] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);

  const { user, logout } = useAuth();
  const { savePortfolio, updatePortfolio } = usePortfolioAPI();

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    const metrics = analyzePortfolio(portfolio);
    setAnalysis(metrics);
    setShowCustomInput(false);
  };

  const handleSavedPortfolioSelect = (savedPortfolio: any) => {
    // Convert saved portfolio format to Portfolio type
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
    
    // Store the ID for editing/updating
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
        holdings: selectedPortfolio.holdings.map(h => ({
          ticker: h.ticker,
          companyName: h.ticker,
          sector: h.sector,
          shares: h.shares || Math.round((h.weight || 0) * 100),
          currentPrice: h.currentPrice || 0,
        })),
      };

      // Check if we're editing an existing portfolio
      if ((selectedPortfolio as any).id) {
        await updatePortfolio((selectedPortfolio as any).id, portfolioData);
        alert('Portfolio updated successfully!');
      } else {
        await savePortfolio(portfolioData);
        alert('Portfolio saved successfully!');
      }
      
      setEditingPortfolio(null);
    } catch (error) {
      console.error('Save failed:', error);
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

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  // Landing page with gradient background
  if (!selectedPortfolio && !showCustomInput) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header with Auth */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '0.5rem',
                  color: 'white'
                }}>
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleLoginClick}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={handleSignUpClick}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '9999px', 
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              ✨ AI-Powered Risk Analysis
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem', lineHeight: '1.2' }}>
              Discover Hidden Risks in<br />
              <span style={{ color: '#fbbf24' }}>Your Portfolio</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '700px', margin: '0 auto 3rem' }}>
              Most investors think owning multiple stocks means diversification. Our AI reveals concentration risks before they cost you money.
            </p>
          </div>

          {/* Saved Portfolios (only if logged in) */}
          {user && (
            <SavedPortfolios 
              onSelectPortfolio={handleSavedPortfolioSelect}
              onEditPortfolio={handleEditPortfolio}
            />
          )}

          {/* Sample Portfolios */}
          <div style={{ marginTop: user ? '3rem' : '0' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'white', 
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              {user ? 'Try Sample Portfolios' : 'Choose a Sample Portfolio'}
            </h2>
            <SamplePortfolios onSelect={handlePortfolioSelect} />
          </div>

          {/* Custom Portfolio Button */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              onClick={() => setShowCustomInput(true)}
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ✏️ Create Custom Portfolio
            </button>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal 
            mode={authMode} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}
      </div>
    );
  }

  // Custom input page
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

  // Analysis page
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '1rem', 
          padding: '2rem', 
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                {selectedPortfolio.name}
              </h2>
              <p style={{ color: '#6b7280' }}>{selectedPortfolio.holdings.length} holdings analyzed</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {user && (
                <button
                  onClick={handleSavePortfolio}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Saving...' : (selectedPortfolio as any).id ? '💾 Update Portfolio' : '💾 Save Portfolio'}
                </button>
              )}
              <button
                onClick={handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {analysis && (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <AINarrative portfolio={selectedPortfolio} metrics={analysis} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
              <RiskSummary metrics={analysis} />
              <SectorBreakdown sectorConcentration={analysis.sectorConcentration} />
            </div>
          </>
        )}
      </div>

      {showAuthModal && (
        <AuthModal 
          mode={authMode} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
}
