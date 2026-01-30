'use client';
import { useState, useEffect } from 'react';
import { Portfolio, RiskMetrics } from '@/types/portfolio';

export default function AINarrative({ portfolio, metrics }: { portfolio: Portfolio; metrics: RiskMetrics }) {
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio, metrics }),
    })
      .then(r => r.json())
      .then(d => {
        setNarrative(d.narrative);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [portfolio, metrics]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '1rem',
      padding: '2rem',
      color: 'white',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2rem' }}>✨</div>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            AI Risk Analysis <span style={{ 
              padding: '0.25rem 0.5rem', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '0.25rem', 
              fontSize: '0.75rem',
              marginLeft: '0.5rem'
            }}>BETA</span>
          </h3>
          <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>Intelligent insights powered by advanced risk analysis</p>
        </div>
      </div>

      {loading ? (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          ⏳ Analyzing your portfolio...
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '0.75rem', 
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.2)',
          lineHeight: '1.7'
        }}>
          💡 {narrative}
        </div>
      )}

      <div style={{ 
        marginTop: '1.5rem', 
        fontSize: '0.75rem', 
        opacity: 0.7,
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>✨ Powered by AI</span>
        <span>Updated just now</span>
      </div>
    </div>
  );
}
