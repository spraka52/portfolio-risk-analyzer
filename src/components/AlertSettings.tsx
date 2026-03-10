'use client';
import { useState, useEffect } from 'react';

interface AlertConfig {
  email: string;
  threshold: 'LOW' | 'MEDIUM' | 'HIGH';
  enabled: boolean;
}

interface AlertSettingsProps {
  portfolioName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  diversificationScore: number;
  topSector: string;
}

const STORAGE_KEY = 'portfolio_alert_config';

const RISK_ORDER: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };

export function loadAlertConfig(): AlertConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function shouldTriggerAlert(config: AlertConfig, riskLevel: string): boolean {
  if (!config.enabled || !config.email) return false;
  return RISK_ORDER[riskLevel] >= RISK_ORDER[config.threshold];
}

export default function AlertSettings({
  portfolioName,
  riskLevel,
  diversificationScore,
  topSector,
}: AlertSettingsProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [enabled, setEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const config = loadAlertConfig();
    if (config) {
      setEmail(config.email);
      setThreshold(config.threshold);
      setEnabled(config.enabled);
    }
  }, []);

  const saveConfig = () => {
    const config: AlertConfig = { email, threshold, enabled };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setMessage('Alert settings saved.');
    setTimeout(() => setMessage(''), 3000);
  };

  const sendTestAlert = async () => {
    if (!email) {
      setMessage('Please enter an email address.');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          portfolioName,
          riskLevel,
          threshold,
          diversificationScore,
          topSector,
        }),
      });
      if (res.ok) {
        setMessage('Test alert sent! Check your inbox.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to send alert.');
      }
    } catch {
      setMessage('Network error. Could not send alert.');
    } finally {
      setSending(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '0.5rem 1rem',
          background: enabled ? '#10b981' : '#f3f4f6',
          color: enabled ? 'white' : '#374151',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
      >
        {enabled ? '🔔' : '🔕'} Alerts {enabled ? 'On' : 'Off'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Risk Alert Settings
              </h3>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9ca3af' }}
              >
                ×
              </button>
            </div>

            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Receive an email when your portfolio's risk level reaches or exceeds the selected threshold.
            </p>

            {/* Enable toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.875rem', color: '#374151' }}>
                Enable Alerts
              </label>
              <button
                onClick={() => setEnabled(!enabled)}
                style={{
                  width: '48px',
                  height: '26px',
                  background: enabled ? '#667eea' : '#e5e7eb',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: enabled ? '25px' : '3px',
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {/* Threshold */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                Alert when risk reaches
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setThreshold(level)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: threshold === level ? '2px solid #667eea' : '1px solid #e5e7eb',
                      background: threshold === level ? '#eff6ff' : 'white',
                      color: threshold === level ? '#667eea' : '#6b7280',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Current risk indicator */}
            <div
              style={{
                background: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: '#6b7280',
              }}
            >
              Current risk for <strong>{portfolioName}</strong>:{' '}
              <span
                style={{
                  fontWeight: '700',
                  color:
                    riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981',
                }}
              >
                {riskLevel}
              </span>
            </div>

            {message && (
              <div
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '0.5rem',
                  background: message.includes('sent') || message.includes('saved') ? '#d1fae5' : '#fee2e2',
                  color: message.includes('sent') || message.includes('saved') ? '#065f46' : '#991b1b',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  fontWeight: '600',
                }}
              >
                {message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={sendTestAlert}
                disabled={sending}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.6 : 1,
                }}
              >
                {sending ? 'Sending...' : 'Send Test'}
              </button>
              <button
                onClick={() => { saveConfig(); setOpen(false); }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
