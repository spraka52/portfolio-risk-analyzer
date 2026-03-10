'use client';
import { useState, useEffect } from 'react';
import { Portfolio, RiskMetrics } from '@/types/portfolio';
import { Scale, TrendingDown, TrendingUp, PlusCircle, XCircle, Loader } from 'lucide-react';

interface Suggestion {
  action: 'REDUCE' | 'INCREASE' | 'ADD' | 'REMOVE';
  ticker: string;
  detail: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const ACTION_CONFIG = {
  REDUCE:   { icon: TrendingDown, color: '#ef4444', bg: '#fee2e2', label: 'Reduce' },
  INCREASE: { icon: TrendingUp,   color: '#10b981', bg: '#d1fae5', label: 'Increase' },
  ADD:      { icon: PlusCircle,   color: '#3b82f6', bg: '#dbeafe', label: 'Add' },
  REMOVE:   { icon: XCircle,      color: '#f59e0b', bg: '#fef3c7', label: 'Remove' },
};

const PRIORITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };

export default function RebalancingSuggestions({ portfolio, metrics }: { portfolio: Portfolio; metrics: RiskMetrics }) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/rebalance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio, metrics }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setSuggestions(d.suggestions ?? []);
      })
      .catch(() => setError('Failed to load suggestions'))
      .finally(() => setLoading(false));
  }, [portfolio.name]);

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Scale size={18} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>Rebalancing Plan</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>AI-generated specific actions to improve your risk profile</p>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
          Generating personalised rebalancing plan...
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.75rem', color: '#991b1b', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '0.75rem', color: '#065f46', fontSize: '0.875rem', fontWeight: '600' }}>
          ✅ Your portfolio looks well-balanced — no immediate rebalancing needed.
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {suggestions.map((s, i) => {
            const cfg = ACTION_CONFIG[s.action] ?? ACTION_CONFIG.REDUCE;
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '1rem 1.25rem',
                  background: '#f9fafb',
                  borderRadius: '0.75rem',
                  border: `1px solid ${cfg.color}22`,
                }}
              >
                <div style={{ width: '32px', height: '32px', background: cfg.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', color: cfg.color, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontWeight: '800', color: '#111827', fontSize: '0.9rem' }}>{s.ticker}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: '700',
                      color: PRIORITY_COLORS[s.priority] ?? '#6b7280',
                      background: `${PRIORITY_COLORS[s.priority]}20`,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {s.priority}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>{s.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
