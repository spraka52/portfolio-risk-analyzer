'use client';
import { TrendingUp, Shield, DollarSign } from 'lucide-react';
import { SAMPLE_PORTFOLIOS } from '@/lib/sampleData';
import { Portfolio } from '@/types/portfolio';

const CONFIGS = [
  {
    Icon: TrendingUp,
    iconBg: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    iconGlow: 'rgba(99,102,241,0.4)',
    description: 'High growth potential with elevated risk',
  },
  {
    Icon: Shield,
    iconBg: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    iconGlow: 'rgba(244,63,94,0.4)',
    description: 'Diversified across multiple sectors',
  },
  {
    Icon: DollarSign,
    iconBg: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    iconGlow: 'rgba(14,165,233,0.4)',
    description: 'Stable returns from established companies',
  },
];

export default function SamplePortfolios({ onSelect }: { onSelect: (p: Portfolio) => void }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem',
      maxWidth: '1000px',
      margin: '0 auto',
    }}>
      {SAMPLE_PORTFOLIOS.map((portfolio, idx) => {
        const { Icon, iconBg, iconGlow, description } = CONFIGS[idx];
        return (
          <button
            key={portfolio.name}
            onClick={() => onSelect(portfolio)}
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Icon */}
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '12px',
              background: iconBg,
              boxShadow: `0 6px 16px ${iconGlow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.25rem',
              color: 'white',
            }}>
              <Icon size={22} />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'white', margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
              {portfolio.name}
            </h3>

            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
              {description}
            </p>

            <div style={{
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                {portfolio.holdings.length} holdings
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Explore →</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
