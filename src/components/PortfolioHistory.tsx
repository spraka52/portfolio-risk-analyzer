'use client';
import { useEffect, useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { History } from 'lucide-react';

interface Snapshot {
  date: string;    // ISO string
  value: number;
  riskLevel: string;
}

const STORAGE_KEY = 'portfolio_value_history';

function loadHistory(): Record<string, Snapshot[]> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch { return {}; }
}

function saveSnapshot(portfolioName: string, value: number, riskLevel: string) {
  const all = loadHistory();
  const snapshots: Snapshot[] = all[portfolioName] ?? [];

  const now = new Date().toISOString();
  // Avoid duplicate snapshots within the same hour
  const lastSnap = snapshots[snapshots.length - 1];
  if (lastSnap) {
    const diffHrs = (Date.now() - new Date(lastSnap.date).getTime()) / 3_600_000;
    if (diffHrs < 1 && lastSnap.value === value) return;
  }

  snapshots.push({ date: now, value, riskLevel });
  // Keep at most 60 snapshots per portfolio
  if (snapshots.length > 60) snapshots.splice(0, snapshots.length - 60);
  all[portfolioName] = snapshots;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

const RISK_COLORS: Record<string, string> = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const snap: Snapshot = payload[0].payload;
  const d = new Date(snap.date);
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem 1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#6b7280' }}>
        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
      <p style={{ margin: '0 0 0.25rem', fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>
        ${snap.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: RISK_COLORS[snap.riskLevel] ?? '#6b7280' }}>
        {snap.riskLevel} RISK
      </span>
    </div>
  );
};

export default function PortfolioHistory({
  portfolio,
  riskLevel,
}: {
  portfolio: Portfolio;
  riskLevel: string;
}) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    if (!portfolio.totalValue) return;
    // Save current state
    saveSnapshot(portfolio.name, portfolio.totalValue, riskLevel);
    // Load for display
    const all = loadHistory();
    setSnapshots(all[portfolio.name] ?? []);
  }, [portfolio.name, portfolio.totalValue, riskLevel]);

  if (snapshots.length < 2) {
    return (
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#9ca3af', textAlign: 'center', fontSize: '0.875rem' }}>
        <History size={24} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
        Value history will appear here after you analyse this portfolio a few times.
      </div>
    );
  }

  const first = snapshots[0].value;
  const last = snapshots[snapshots.length - 1].value;
  const changePct = ((last - first) / first) * 100;

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={18} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>Portfolio Value Over Time</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{snapshots.length} snapshots tracked</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.02em' }}>
            ${last.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: changePct >= 0 ? '#10b981' : '#ef4444' }}>
            {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}% since first recorded
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={snapshots} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tickFormatter={v => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2} fill="url(#valueGrad)" dot={false} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
