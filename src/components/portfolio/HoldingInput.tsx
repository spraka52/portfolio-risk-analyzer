'use client';
import { HoldingInput as HoldingInputType } from '@/lib/utils/portfolio';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import StockSearchDropdown from './StockSearchDropdown';
import { SearchResult } from '@/lib/api/stocks';

interface HoldingInputProps {
  holding: HoldingInputType & { loading?: boolean; error?: string };
  onTickerChange: (value: string) => void;
  onTickerBlur: () => void;
  onSharesChange: (value: number) => void;
  onRemove?: () => void;
  searchResults: SearchResult[];
  onSelectTicker: (ticker: string) => void;
  showSearch: boolean;
}

export default function HoldingInputComponent({
  holding,
  onTickerChange,
  onTickerBlur,
  onSharesChange,
  onRemove,
  searchResults,
  onSelectTicker,
  showSearch,
}: HoldingInputProps) {
  return (
    <div style={{ width: '100%' }}>
      {/* Input row */}
      <div style={{ 
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
        width: '100%'
      }}>
        {/* Ticker */}
        <div style={{ position: 'relative', flex: '0 0 120px' }}>
          <Input
            value={holding.ticker}
            onChange={onTickerChange}
            onBlur={onTickerBlur}
            placeholder="AAPL"
            error={!!holding.error}
          />
          
          {holding.loading && (
            <div style={{ 
              position: 'absolute', 
              right: '0.5rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              fontSize: '0.75rem'
            }}>⏳</div>
          )}

          {showSearch && <StockSearchDropdown results={searchResults} onSelect={onSelectTicker} />}
        </div>

        {/* Shares */}
        <div style={{ flex: '0 0 100px' }}>
          <Input
            type="number"
            value={holding.shares || ''}
            onChange={(val) => onSharesChange(parseFloat(val) || 0)}
            placeholder="Shares"
          />
        </div>

        {/* Value */}
        <div style={{ 
          flex: '0 0 130px',
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          textAlign: 'right'
        }}>
          {holding.price && holding.shares 
            ? `$${(holding.price * holding.shares).toLocaleString('en-US', { maximumFractionDigits: 0 })}` 
            : '$0.00'
          }
        </div>

        {/* Remove */}
        {onRemove && (
          <div style={{ flex: '0 0 auto' }}>
            <Button variant="danger" onClick={onRemove}>
              ✕
            </Button>
          </div>
        )}
      </div>

      {/* Stock info below */}
      {holding.sector && !holding.loading && (
        <div style={{ 
          fontSize: '0.75rem', 
          marginTop: '0.5rem', 
          color: '#6b7280' 
        }}>
          <span style={{ color: '#10b981', fontWeight: '600' }}>✓ {holding.name}</span>
          {' • '}
          {holding.sector} • ${holding.price?.toFixed(2)}/share
        </div>
      )}

      {holding.error && (
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#ef4444', 
          marginTop: '0.5rem', 
          fontWeight: '500' 
        }}>
          {holding.error}
        </div>
      )}
    </div>
  );
}
