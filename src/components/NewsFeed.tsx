'use client';
import { useState, useEffect } from 'react';
import { Portfolio } from '@/types/portfolio';
import { Newspaper, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface Article {
  headline: string;
  url: string;
  source: string;
  datetime: number;
  summary?: string;
}

function timeAgo(unixTs: number): string {
  const diffMs = Date.now() - unixTs * 1000;
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NewsFeed({ portfolio }: { portfolio: Portfolio }) {
  const [news, setNews] = useState<Record<string, Article[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const tickers = portfolio.holdings
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 6)
    .map(h => h.ticker);

  useEffect(() => {
    if (tickers.length === 0) return;
    setLoading(true);
    fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickers }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setNews(d.news ?? {});
      })
      .catch(() => setError('Could not load news'))
      .finally(() => setLoading(false));
  }, [portfolio.name]);

  const holdingsWithNews = tickers.filter(t => (news[t] ?? []).length > 0);
  const totalArticles = Object.values(news).reduce((s, a) => s + a.length, 0);

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Newspaper size={18} color="white" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: 0 }}>Latest News</h3>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
            {loading ? 'Fetching headlines...' : `${totalArticles} articles · top 6 holdings · past 14 days`}
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '52px', background: '#f3f4f6', borderRadius: '0.5rem', animation: 'pulse 2s infinite' }} />
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.75rem', color: '#991b1b', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && holdingsWithNews.length === 0 && (
        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.75rem', color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>
          No recent news found for your top holdings.
        </div>
      )}

      {!loading && holdingsWithNews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {holdingsWithNews.map(ticker => {
            const articles = news[ticker] ?? [];
            const isOpen = expanded === ticker;
            return (
              <div key={ticker} style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
                {/* Accordion header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : ticker)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', background: isOpen ? '#f9fafb' : 'white',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: '800', color: '#111827', fontSize: '0.9rem', minWidth: '48px' }}>{ticker}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
                  </div>
                  {isOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                </button>

                {/* Articles */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #e5e7eb' }}>
                    {articles.map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          padding: '0.875rem 1rem',
                          borderBottom: i < articles.length - 1 ? '1px solid #f3f4f6' : 'none',
                          textDecoration: 'none',
                          background: 'white',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', lineHeight: '1.4', marginBottom: '0.25rem' }}>
                            {article.headline}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: '#9ca3af' }}>
                            <span>{article.source}</span>
                            <span>{timeAgo(article.datetime)}</span>
                          </div>
                        </div>
                        <ExternalLink size={13} color="#d1d5db" style={{ flexShrink: 0, marginTop: '3px' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
