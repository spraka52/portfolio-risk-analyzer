'use client';
import { SearchResult } from '@/lib/api/stocks';

interface StockSearchDropdownProps {
  results: SearchResult[];
  onSelect: (ticker: string) => void;
}

export default function StockSearchDropdown({ results, onSelect }: StockSearchDropdownProps) {
  if (results.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      marginTop: '0.25rem',
      zIndex: 10,
      maxHeight: '200px',
      overflowY: 'auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {results.map((result) => (
        <button
          key={result.ticker}
          onClick={() => onSelect(result.ticker)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            background: 'white',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '0.875rem',
            borderBottom: '1px solid #f3f4f6'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
          <div style={{ fontWeight: '600', color: '#111827' }}>{result.ticker}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{result.name}</div>
        </button>
      ))}
    </div>
  );
}
