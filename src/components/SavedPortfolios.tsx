'use client';
import { useEffect, useState } from 'react';
import { usePortfolioAPI } from '@/hooks/usePortfolioAPI';
import { Trash2, TrendingUp, Edit } from 'lucide-react';

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
      setPortfolios(data);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this portfolio?')) return;

    try {
      await deletePortfolio(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (error) {
      alert('Failed to delete portfolio');
    }
  };

  const handleEdit = (portfolio: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPortfolio(portfolio);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'white' }}>
        Loading your portfolios...
      </div>
    );
  }

  if (portfolios.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '3rem' }}>
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: '700', 
        color: 'white', 
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        My Saved Portfolios
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {portfolios.map((portfolio) => {
          const getRiskColor = (level: string) => {
            if (level === 'HIGH') return '#ef4444';
            if (level === 'MEDIUM') return '#f59e0b';
            return '#10b981';
          };

          return (
            <div
              key={portfolio.id}
              onClick={() => onSelectPortfolio(portfolio)}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  {portfolio.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => handleEdit(portfolio, e)}
                    style={{
                      background: '#dbeafe',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
                  >
                    <Edit className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(portfolio.id, e)}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Value</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                  ${portfolio.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Risk Level</span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '700',
                  color: getRiskColor(portfolio.riskLevel),
                  padding: '0.25rem 0.75rem',
                  background: `${getRiskColor(portfolio.riskLevel)}20`,
                  borderRadius: '0.375rem'
                }}>
                  {portfolio.riskLevel}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {portfolio.holdings?.length || 0} holdings
                </span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
