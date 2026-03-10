'use client';
import { useState, useEffect } from 'react';
import { Portfolio } from '@/types/portfolio';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface AdvancedMetrics {
  sharpeRatio: number;
  beta: number;
  alpha: number;
  annualizedReturn: number;
  annualizedVolatility: number;
  maxDrawdown: number;
}

interface PerformancePoint {
  date: string;
  portfolio: number;
  spy: number;
}

function MetricCard({
  label,
  value,
  description,
  color,
}: {
  label: string;
  value: string;
  description: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#f9fafb',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        borderLeft: `4px solid ${color || '#667eea'}`,
      }}
    >
      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: color || '#111827', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{description}</div>
    </div>
  );
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
      <p style={{ margin: '0 0 0.5rem', fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: entry.color, fontWeight: '600' }}>
          {entry.name === 'portfolio' ? 'Your Portfolio' : 'S&P 500'}: {entry.value > 0 ? '+' : ''}{entry.value}%
        </p>
      ))}
    </div>
  );
};

export default function PortfolioAnalytics({ portfolio }: { portfolio: Portfolio }) {
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [metrics, setMetrics] = useState<AdvancedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const tickers = portfolio.holdings.map((h) => h.ticker).filter(Boolean);
    const weights = portfolio.holdings.map((h) => h.weight || 0);
    if (tickers.length === 0) return;

    setLoading(true);
    setError('');

    fetch('/api/historical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers, weights }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // Downsample for chart readability (show ~52 points = weekly)
          const step = Math.max(1, Math.floor(data.performance.length / 52));
          setPerformance(data.performance.filter((_: any, i: number) => i % step === 0));
          setMetrics(data.metrics);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load historical data.');
        setLoading(false);
      });
  }, [portfolio.name]);

  if (loading) {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#6b7280',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        Loading historical performance...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#9ca3af',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        Historical data unavailable: {error}
      </div>
    );
  }

  const latestPort = performance[performance.length - 1]?.portfolio ?? 0;
  const latestSpy = performance[performance.length - 1]?.spy ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Advanced Metrics */}
      {metrics && (
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
            Advanced Metrics — 1 Year
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            <MetricCard
              label="Sharpe Ratio"
              value={metrics.sharpeRatio.toFixed(2)}
              description="Return per unit of risk"
              color={metrics.sharpeRatio >= 1 ? '#10b981' : metrics.sharpeRatio >= 0 ? '#f59e0b' : '#ef4444'}
            />
            <MetricCard
              label="Beta"
              value={metrics.beta.toFixed(2)}
              description="Sensitivity to market"
              color={metrics.beta > 1.2 ? '#ef4444' : metrics.beta > 0.8 ? '#6b7280' : '#10b981'}
            />
            <MetricCard
              label="Alpha"
              value={`${metrics.alpha >= 0 ? '+' : ''}${metrics.alpha.toFixed(2)}%`}
              description="Excess return vs benchmark"
              color={metrics.alpha >= 0 ? '#10b981' : '#ef4444'}
            />
            <MetricCard
              label="Annual Return"
              value={`${metrics.annualizedReturn >= 0 ? '+' : ''}${metrics.annualizedReturn.toFixed(1)}%`}
              description="Annualised (1 yr)"
              color={metrics.annualizedReturn >= 0 ? '#10b981' : '#ef4444'}
            />
            <MetricCard
              label="Volatility"
              value={`${metrics.annualizedVolatility.toFixed(1)}%`}
              description="Annualised std deviation"
              color="#6b7280"
            />
            <MetricCard
              label="Max Drawdown"
              value={`-${metrics.maxDrawdown.toFixed(1)}%`}
              description="Largest peak-to-trough loss"
              color="#ef4444"
            />
          </div>
        </div>
      )}

      {/* Historical Performance Chart */}
      {performance.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
              Historical Performance vs S&P 500 — 1 Year
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#667eea', fontWeight: '700' }}>
                Portfolio: {latestPort >= 0 ? '+' : ''}{latestPort}%
              </span>
              <span style={{ color: '#9ca3af', fontWeight: '700' }}>
                S&P 500: {latestSpy >= 0 ? '+' : ''}{latestSpy}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={performance} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (value === 'portfolio' ? 'Your Portfolio' : 'S&P 500')}
                wrapperStyle={{ fontSize: '0.875rem' }}
              />
              <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="#667eea"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="spy"
                stroke="#d1d5db"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
