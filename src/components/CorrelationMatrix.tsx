'use client';
import { Portfolio } from '@/types/portfolio';

// Sector-pair correlation lookup (symmetric).
// Values are approximate historical correlations between sectors.
const SECTOR_CORRELATIONS: Record<string, Record<string, number>> = {
  Technology: { Technology: 1.0, 'Communication Services': 0.75, 'Consumer Discretionary': 0.65, Healthcare: 0.40, Financials: 0.45, Industrials: 0.50, Energy: 0.25, Utilities: 0.10, 'Real Estate': 0.15, Materials: 0.35, 'Consumer Staples': 0.20 },
  'Communication Services': { Technology: 0.75, 'Communication Services': 1.0, 'Consumer Discretionary': 0.60, Healthcare: 0.35, Financials: 0.40, Industrials: 0.45, Energy: 0.20, Utilities: 0.10, 'Real Estate': 0.15, Materials: 0.30, 'Consumer Staples': 0.25 },
  'Consumer Discretionary': { Technology: 0.65, 'Communication Services': 0.60, 'Consumer Discretionary': 1.0, Healthcare: 0.35, Financials: 0.50, Industrials: 0.55, Energy: 0.30, Utilities: 0.15, 'Real Estate': 0.20, Materials: 0.40, 'Consumer Staples': 0.50 },
  Healthcare: { Technology: 0.40, 'Communication Services': 0.35, 'Consumer Discretionary': 0.35, Healthcare: 1.0, Financials: 0.35, Industrials: 0.40, Energy: 0.20, Utilities: 0.25, 'Real Estate': 0.20, Materials: 0.30, 'Consumer Staples': 0.45 },
  Financials: { Technology: 0.45, 'Communication Services': 0.40, 'Consumer Discretionary': 0.50, Healthcare: 0.35, Financials: 1.0, Industrials: 0.55, Energy: 0.45, Utilities: 0.30, 'Real Estate': 0.55, Materials: 0.45, 'Consumer Staples': 0.35 },
  Industrials: { Technology: 0.50, 'Communication Services': 0.45, 'Consumer Discretionary': 0.55, Healthcare: 0.40, Financials: 0.55, Industrials: 1.0, Energy: 0.50, Utilities: 0.30, 'Real Estate': 0.35, Materials: 0.60, 'Consumer Staples': 0.40 },
  Energy: { Technology: 0.25, 'Communication Services': 0.20, 'Consumer Discretionary': 0.30, Healthcare: 0.20, Financials: 0.45, Industrials: 0.50, Energy: 1.0, Utilities: 0.45, 'Real Estate': 0.35, Materials: 0.55, 'Consumer Staples': 0.30 },
  Utilities: { Technology: 0.10, 'Communication Services': 0.10, 'Consumer Discretionary': 0.15, Healthcare: 0.25, Financials: 0.30, Industrials: 0.30, Energy: 0.45, Utilities: 1.0, 'Real Estate': 0.60, Materials: 0.30, 'Consumer Staples': 0.45 },
  'Real Estate': { Technology: 0.15, 'Communication Services': 0.15, 'Consumer Discretionary': 0.20, Healthcare: 0.20, Financials: 0.55, Industrials: 0.35, Energy: 0.35, Utilities: 0.60, 'Real Estate': 1.0, Materials: 0.35, 'Consumer Staples': 0.35 },
  Materials: { Technology: 0.35, 'Communication Services': 0.30, 'Consumer Discretionary': 0.40, Healthcare: 0.30, Financials: 0.45, Industrials: 0.60, Energy: 0.55, Utilities: 0.30, 'Real Estate': 0.35, Materials: 1.0, 'Consumer Staples': 0.35 },
  'Consumer Staples': { Technology: 0.20, 'Communication Services': 0.25, 'Consumer Discretionary': 0.50, Healthcare: 0.45, Financials: 0.35, Industrials: 0.40, Energy: 0.30, Utilities: 0.45, 'Real Estate': 0.35, Materials: 0.35, 'Consumer Staples': 1.0 },
};

function getCorrelation(sectorA: string, sectorB: string): number {
  return SECTOR_CORRELATIONS[sectorA]?.[sectorB]
    ?? SECTOR_CORRELATIONS[sectorB]?.[sectorA]
    ?? (sectorA === sectorB ? 1.0 : 0.35);
}

function correlationColor(value: number): string {
  // Red (high corr) → neutral (mid) → green (low corr)
  if (value >= 0.8) return '#fca5a5';
  if (value >= 0.65) return '#fcd34d';
  if (value >= 0.5) return '#fde68a';
  if (value >= 0.35) return '#bbf7d0';
  return '#86efac';
}

function correlationTextColor(value: number): string {
  return value >= 0.5 ? '#111827' : '#111827';
}

export default function CorrelationMatrix({ portfolio }: { portfolio: Portfolio }) {
  // Use top 8 holdings to keep the matrix readable
  const holdings = [...portfolio.holdings]
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 8);

  if (holdings.length < 2) return null;

  // Compute overall portfolio correlation (weighted average of all pairs)
  let totalWeight = 0;
  let weightedCorr = 0;
  for (let i = 0; i < holdings.length; i++) {
    for (let j = 0; j < holdings.length; j++) {
      if (i === j) continue;
      const wi = (holdings[i].weight ?? 0) / 100;
      const wj = (holdings[j].weight ?? 0) / 100;
      const corr = getCorrelation(holdings[i].sector ?? 'Technology', holdings[j].sector ?? 'Technology');
      weightedCorr += wi * wj * corr;
      totalWeight += wi * wj;
    }
  }
  const avgCorr = totalWeight > 0 ? weightedCorr / totalWeight : 0;

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem' }}>
            Correlation Matrix
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
            How your holdings move together — based on sector correlations
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Avg Correlation</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: avgCorr > 0.6 ? '#ef4444' : avgCorr > 0.4 ? '#f59e0b' : '#10b981' }}>
            {avgCorr.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{avgCorr > 0.6 ? 'High overlap' : avgCorr > 0.4 ? 'Moderate overlap' : 'Well diversified'}</div>
        </div>
      </div>

      {/* Matrix */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: '#9ca3af', fontWeight: '600', width: '80px' }} />
              {holdings.map(h => (
                <th key={h.ticker} style={{ padding: '0.5rem', textAlign: 'center', color: '#374151', fontWeight: '700', minWidth: '52px' }}>
                  {h.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map(rowH => (
              <tr key={rowH.ticker}>
                <td style={{ padding: '0.375rem 0.5rem', fontWeight: '700', color: '#374151', whiteSpace: 'nowrap' }}>
                  {rowH.ticker}
                </td>
                {holdings.map(colH => {
                  const corr = getCorrelation(rowH.sector ?? 'Technology', colH.sector ?? 'Technology');
                  const isDiag = rowH.ticker === colH.ticker;
                  return (
                    <td
                      key={colH.ticker}
                      title={`${rowH.ticker} × ${colH.ticker}: ${corr.toFixed(2)}`}
                      style={{
                        padding: '0.375rem',
                        textAlign: 'center',
                        background: isDiag ? '#1e1b4b' : correlationColor(corr),
                        color: isDiag ? 'white' : correlationTextColor(corr),
                        fontWeight: '600',
                        borderRadius: '4px',
                        border: '2px solid white',
                      }}
                    >
                      {isDiag ? '—' : corr.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '600' }}>Correlation:</span>
        {[
          { label: '0.8+  High', color: '#fca5a5' },
          { label: '0.5–0.8  Medium', color: '#fde68a' },
          { label: '< 0.5  Low', color: '#86efac' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '14px', height: '14px', background: color, borderRadius: '3px' }} />
            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{label}</span>
          </div>
        ))}
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
          Showing top {holdings.length} holdings by weight
        </span>
      </div>
    </div>
  );
}
