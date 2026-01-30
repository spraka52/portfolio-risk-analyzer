'use client';
import { SAMPLE_PORTFOLIOS } from '@/lib/sampleData';
import { Portfolio } from '@/types/portfolio';

export default function SamplePortfolios({ onSelect }: { onSelect: (p: Portfolio) => void }) {
  const colors = ['#3b82f6', '#ec4899', '#06b6d4'];
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {SAMPLE_PORTFOLIOS.map((portfolio, idx) => (
        <button
          key={portfolio.name}
          onClick={() => onSelect(portfolio)}
          style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: colors[idx],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            fontSize: '1.75rem'
          }}>
            {idx === 0 ? '📈' : idx === 1 ? '🛡️' : '💰'}
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' }}>
            {portfolio.name}
          </h3>
          
          <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {idx === 0 ? 'High growth potential with elevated risk' :
             idx === 1 ? 'Diversified across multiple sectors' :
             'Stable returns from established companies'}
          </p>

          <div style={{ 
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#9ca3af',
            fontSize: '0.875rem'
          }}>
            <span>{portfolio.holdings.length} holdings</span>
            <span>→</span>
          </div>
        </button>
      ))}
    </div>
  );
}
