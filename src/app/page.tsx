'use client';
import { useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import SamplePortfolios from '@/components/SamplePortfolios';
import SectorBreakdown from '@/components/SectorBreakdown';
import RiskSummary from '@/components/RiskSummary';
import AINarrative from '@/components/AINarrative';

export default function Home() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePortfolio> | null>(null);

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    const metrics = analyzePortfolio(portfolio);
    setAnalysis(metrics);
  };

  // Landing page with gradient background
  if (!selectedPortfolio) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

          <SamplePortfolios onSelect={handlePortfolioSelect} />
        </div>
      </div>
    );
  }

  // Analysis page with clean white background
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                {selectedPortfolio.name}
              </h2>
              <p style={{ color: '#6b7280' }}>{selectedPortfolio.holdings.length} holdings analyzed</p>
            </div>
            <button
              onClick={() => {
                setSelectedPortfolio(null);
                setAnalysis(null);
              }}
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
    </div>
  );
}
