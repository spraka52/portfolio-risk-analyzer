'use client';
import { useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { HoldingInput, calculatePortfolioValue, convertToPortfolio, validateHoldings } from '@/lib/utils/portfolio';
import { useStockData } from '@/hooks/useStockData';
import { useStockSearch } from '@/hooks/useStockSearch';
import HoldingInputComponent from './HoldingInput';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface CustomPortfolioInputProps {
  onAnalyze: (portfolio: Portfolio) => void;
  onCancel: () => void;
}

export default function CustomPortfolioInput({ onAnalyze, onCancel }: CustomPortfolioInputProps) {
  const [portfolioName, setPortfolioName] = useState('My Portfolio');
  const [holdings, setHoldings] = useState<(HoldingInput & { loading?: boolean; error?: string })[]>([
    { ticker: '', shares: 0 }
  ]);
  const [activeSearch, setActiveSearch] = useState<number | null>(null);

  const { fetch: fetchStock } = useStockData();
  const { results: searchResults, search, clear: clearSearch } = useStockSearch();

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', shares: 0 }]);
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const handleTickerChange = (index: number, value: string) => {
    const updated = [...holdings];
    updated[index].ticker = value.toUpperCase();
    updated[index].error = undefined; // Clear error when typing
    setHoldings(updated);

    if (value.length >= 1) {
      setActiveSearch(index);
      search(value);
    } else {
      clearSearch();
      setActiveSearch(null);
    }
  };

  const handleSelectTicker = async (index: number, ticker: string) => {
    const updated = [...holdings];
    updated[index].ticker = ticker;
    updated[index].loading = true;
    updated[index].error = undefined; // Clear error before fetching
    setHoldings(updated);
    
    clearSearch();
    setActiveSearch(null);
    
    const data = await fetchStock(ticker);
    
    const newUpdated = [...holdings];
    if (data) {
      newUpdated[index] = {
        ...newUpdated[index],
        name: data.name,
        price: data.price,
        sector: data.sector,
        loading: false,
        error: undefined, // Explicitly clear error on success
      };
    } else {
      newUpdated[index].loading = false;
      newUpdated[index].error = 'Stock not found';
    }
    setHoldings(newUpdated);
  };

  const handleTickerBlur = async (index: number) => {
    setTimeout(() => {
      clearSearch();
      setActiveSearch(null);
    }, 200);

    const holding = holdings[index];
    if (holding.ticker && !holding.sector && !holding.loading) {
      const updated = [...holdings];
      updated[index].loading = true;
      updated[index].error = undefined; // Clear error before fetching
      setHoldings(updated);
      
      const data = await fetchStock(holding.ticker);
      
      const newUpdated = [...holdings];
      if (data) {
        newUpdated[index] = {
          ...newUpdated[index],
          name: data.name,
          price: data.price,
          sector: data.sector,
          loading: false,
          error: undefined, // Explicitly clear error on success
        };
      } else {
        newUpdated[index].loading = false;
        newUpdated[index].error = 'Stock not found';
      }
      setHoldings(newUpdated);
    }
  };

  const handleSharesChange = (index: number, value: number) => {
    const updated = [...holdings];
    updated[index].shares = value;
    setHoldings(updated);
  };

  const handleAnalyze = () => {
    const error = validateHoldings(holdings);
    if (error) {
      alert(error);
      return;
    }

    const portfolio = convertToPortfolio(portfolioName, holdings);
    onAnalyze(portfolio);
  };

  const totalValue = calculatePortfolioValue(holdings);

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '1rem', 
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
        Create Custom Portfolio
      </h2>

      {/* Portfolio Name */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '0.5rem' 
        }}>
          Portfolio Name
        </label>
        <Input
          value={portfolioName}
          onChange={setPortfolioName}
          placeholder="e.g., My Growth Portfolio"
        />
      </div>

      {/* Holdings */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Holdings
          </label>
          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
            Total Value: ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {holdings.map((holding, index) => (
            <HoldingInputComponent
              key={index}
              holding={holding}
              onTickerChange={(val) => handleTickerChange(index, val)}
              onTickerBlur={() => handleTickerBlur(index)}
              onSharesChange={(val) => handleSharesChange(index, val)}
              onRemove={holdings.length > 1 ? () => removeHolding(index) : undefined}
              searchResults={searchResults}
              onSelectTicker={(ticker) => handleSelectTicker(index, ticker)}
              showSearch={activeSearch === index}
            />
          ))}
        </div>

        <button
          onClick={addHolding}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#f3f4f6',
            color: '#374151',
            border: '2px dashed #d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem',
            width: '100%'
          }}
        >
          + Add Another Holding
        </button>
      </div>

      {/* Tip */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        color: '#1e40af'
      }}>
        💡 <strong>Tip:</strong> Start typing a ticker symbol and we'll fetch live data including current price, company name, and sector classification.
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAnalyze} fullWidth>
          Analyze Portfolio →
        </Button>
      </div>
    </div>
  );
}
