'use client';
import { useState } from 'react';
import { Portfolio, Holding } from '@/types/portfolio';

interface CustomPortfolioInputProps {
  onAnalyze: (portfolio: Portfolio) => void;
  onCancel: () => void;
}

const SECTORS = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Communication Services',
  'Energy',
  'Utilities',
  'Real Estate',
  'Basic Materials',
  'Industrials',
];

export default function CustomPortfolioInput({ onAnalyze, onCancel }: CustomPortfolioInputProps) {
  const [portfolioName, setPortfolioName] = useState('My Portfolio');
  const [holdings, setHoldings] = useState<Holding[]>([
    { ticker: '', weight: 0, sector: 'Technology' }
  ]);

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', weight: 0, sector: 'Technology' }]);
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const updateHolding = (index: number, field: keyof Holding, value: string | number) => {
    const updated = [...holdings];
    updated[index] = { ...updated[index], [field]: value };
    setHoldings(updated);
  };

  const handleAnalyze = () => {
    const totalWeight = holdings.reduce((sum, h) => sum + (h.weight || 0), 0);
    
    if (totalWeight === 0) {
      alert('Please enter at least one holding with a weight');
      return;
    }

    // Normalize to 100%
    const normalizedHoldings = holdings
      .filter(h => h.ticker && h.weight && h.weight > 0)
      .map(h => ({
        ...h,
        weight: (h.weight! / totalWeight) * 100
      }));

    if (normalizedHoldings.length === 0) {
      alert('Please enter valid holdings');
      return;
    }

    const portfolio: Portfolio = {
      name: portfolioName || 'My Portfolio',
      holdings: normalizedHoldings
    };

    onAnalyze(portfolio);
  };

  const totalWeight = holdings.reduce((sum, h) => sum + (Number(h.weight) || 0), 0);

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '1rem', 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
        Create Custom Portfolio
      </h2>

      {/* Portfolio Name */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '0.5rem' 
        }}>
          Portfolio Name
        </label>
        <input
          type="text"
          value={portfolioName}
          onChange={(e) => setPortfolioName(e.target.value)}
          placeholder="e.g., My Growth Portfolio"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#667eea'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Holdings */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Holdings
          </label>
          <span style={{ 
            fontSize: '0.875rem', 
            color: totalWeight === 100 ? '#10b981' : '#6b7280',
            fontWeight: '600'
          }}>
            Total: {totalWeight.toFixed(1)}%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {holdings.map((holding, index) => (
            <div 
              key={index}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 2fr auto',
                gap: '0.75rem',
                alignItems: 'center'
              }}
            >
              {/* Ticker */}
              <input
                type="text"
                placeholder="Ticker (e.g., AAPL)"
                value={holding.ticker}
                onChange={(e) => updateHolding(index, 'ticker', e.target.value.toUpperCase())}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Weight */}
              <input
                type="number"
                placeholder="%"
                value={holding.weight || ''}
                onChange={(e) => updateHolding(index, 'weight', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />

              {/* Sector */}
              <select
                value={holding.sector}
                onChange={(e) => updateHolding(index, 'sector', e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              {/* Remove Button */}
              {holdings.length > 1 && (
                <button
                  onClick={() => removeHolding(index)}
                  style={{
                    padding: '0.75rem',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addHolding}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            color: '#374151',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          + Add Another Holding
        </button>
      </div>

      {/* Tip */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        color: '#1e40af'
      }}>
        💡 <strong>Tip:</strong> Weights will be automatically normalized to 100%. You can enter any numbers (e.g., # of shares or $ amounts).
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '1rem',
            background: '#f3f4f6',
            color: '#374151',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
        >
          Cancel
        </button>
        <button
          onClick={handleAnalyze}
          style={{
            flex: 2,
            padding: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Analyze Portfolio →
        </button>
      </div>
    </div>
  );
}
