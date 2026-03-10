'use client';
import { useEffect, useState } from 'react';
import { usePortfolioAPI } from '@/hooks/usePortfolioAPI';
import { Trash2, TrendingUp, Edit2 } from 'lucide-react';

interface SavedPortfoliosProps {
  onSelectPortfolio: (portfolio: any) => void;
  onEditPortfolio: (portfolio: any) => void;
}

export default function SavedPortfolios({ onSelectPortfolio, onEditPortfolio }: SavedPortfoliosProps) {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getPortfolios, deletePortfolio } = usePortfolioAPI();

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const data = await getPortfolios();
      // Deduplicate by name — keep the entry with the highest id (most recent save)
      const seen = new Map<string, any>();
      for (const p of data) {
        if (!seen.has(p.name) || p.id > seen.get(p.name).id) {
          seen.set(p.name, p);
        }
      }
      setPortfolios(Array.from(seen.values()));
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this portfolio?')) return;
    try {
      await deletePortfolio(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete portfolio');
    }
  };

  const handleEdit = (portfolio: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPortfolio(portfolio);
  };

  const getRiskStyle = (level: string) => {
    if (level === 'HIGH') return { color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: '#f87171' };
    if (level === 'MEDIUM') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: '#fbbf24' };
    return { color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: '#34d399' };
  };

  if (loading) {
    return (
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '1.25rem',
              height: '170px',
              animation: 'pulse 2s infinite',
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) return null;

  return (
    <div style={{ marginTop: '3rem' }}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.12)', maxWidth: '100px' }} />
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          My Saved Portfolios
        </span>
        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.12)', maxWidth: '100px' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {portfolios.map((portfolio) => {
          const risk = getRiskStyle(portfolio.riskLevel);
          return (
            <div
              key={portfolio.id}
              onClick={() => onSelectPortfolio(portfolio)}
              style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderLeft: `3px solid ${risk.border}`,
                borderRadius: '1.25rem',
                padding: '1.5rem',
                cursor: 'pointer',
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
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', margin: '0 0 0.375rem' }}>
                    {portfolio.name}
                  </h3>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: '700',
                    color: risk.color,
                    background: risk.bg,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {portfolio.riskLevel} Risk
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={(e) => handleEdit(portfolio, e)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.5rem', padding: '0.375rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(portfolio.id, e)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.5rem', padding: '0.375rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Value */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                  Total Value
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white', letterSpacing: '-0.03em' }}>
                  ${portfolio.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '0.875rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                  {portfolio.holdings?.length || 0} holdings
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
                  <TrendingUp size={13} />
                  <span>Analyze →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
