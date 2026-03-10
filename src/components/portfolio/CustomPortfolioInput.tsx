'use client';
import { useState, useEffect, useRef } from 'react';
import { Portfolio } from '@/types/portfolio';
import { HoldingInput, calculatePortfolioValue, convertToPortfolio, validateHoldings } from '@/lib/utils/portfolio';
import { useStockData } from '@/hooks/useStockData';
import { useStockSearch } from '@/hooks/useStockSearch';
import HoldingInputComponent from './HoldingInput';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/** Parse a CSV string into rows of [ticker, shares] pairs.
 *  Supports header row detection and both comma/tab delimiters.
 */
function parseCSV(text: string): { ticker: string; shares: number }[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const rows = lines.map((l) => l.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, '')));

  // Detect header: first row contains non-numeric in second column or words like "ticker"/"symbol"
  const firstRow = rows[0];
  const isHeader =
    isNaN(Number(firstRow[1])) ||
    /ticker|symbol|shares|quantity|stock/i.test(firstRow[0]);

  const dataRows = isHeader ? rows.slice(1) : rows;

  return dataRows
    .filter((r) => r.length >= 2 && r[0])
    .map((r) => ({
      ticker: r[0].toUpperCase().replace(/[^A-Z0-9.^-]/g, ''),
      shares: parseFloat(r[1]) || 0,
    }))
    .filter((r) => r.ticker && r.shares > 0);
}

interface CustomPortfolioInputProps {
  onAnalyze: (portfolio: Portfolio) => void;
  onCancel: () => void;
  existingPortfolio?: any; // For editing
}

export default function CustomPortfolioInput({ onAnalyze, onCancel, existingPortfolio }: CustomPortfolioInputProps) {
  const [portfolioName, setPortfolioName] = useState('My Portfolio');
  const [holdings, setHoldings] = useState<(HoldingInput & { loading?: boolean; error?: string })[]>([
    { ticker: '', shares: 0 }
  ]);
  const [activeSearch, setActiveSearch] = useState<number | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fetch: fetchStock } = useStockData();
  const { results: searchResults, search, clear: clearSearch } = useStockSearch();

  // Load existing portfolio data if editing
  useEffect(() => {
    if (existingPortfolio) {
      setPortfolioName(existingPortfolio.name);
      const loadedHoldings = existingPortfolio.holdings.map((h: any) => ({
        ticker: h.ticker,
        shares: h.shares,
        name: h.companyName,
        price: h.currentPrice,
        sector: h.sector,
      }));
      setHoldings(loadedHoldings.length > 0 ? loadedHoldings : [{ ticker: '', shares: 0 }]);
    }
  }, [existingPortfolio]);

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', shares: 0 }]);
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const handleTickerChange = (index: number, value: string) => {
    const updated = [...holdings];
    updated[index].ticker = value.toUpperCase();
    updated[index].error = undefined;
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
    updated[index].error = undefined;
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
        error: undefined,
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
      updated[index].error = undefined;
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
          error: undefined,
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

  const handleCSVFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvImporting(true);
    const text = await file.text();
    const parsed = parseCSV(text);

    if (parsed.length === 0) {
      alert('No valid rows found. Expected format: Ticker,Shares (one per line).');
      setCsvImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Start with empty slots for each parsed row
    const newHoldings: (HoldingInput & { loading?: boolean; error?: string })[] = parsed.map((r) => ({
      ticker: r.ticker,
      shares: r.shares,
      loading: true,
    }));
    setHoldings(newHoldings);

    // Fetch stock data for each ticker
    const fetched = await Promise.all(
      parsed.map(async (r) => {
        const data = await fetchStock(r.ticker);
        return data
          ? { ticker: r.ticker, shares: r.shares, name: data.name, price: data.price, sector: data.sector, loading: false }
          : { ticker: r.ticker, shares: r.shares, loading: false, error: 'Not found' };
      })
    );

    setHoldings(fetched);
    setCsvImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    const error = validateHoldings(holdings);
    if (error) {
      alert(error);
      return;
    }

    const portfolio = convertToPortfolio(portfolioName, holdings);
    
    // Pass portfolio ID if editing
    if (existingPortfolio) {
      (portfolio as any).id = existingPortfolio.id;
    }
    
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
        {existingPortfolio ? 'Edit Portfolio' : 'Create Custom Portfolio'}
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
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
            Holdings
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              style={{ display: 'none' }}
              onChange={handleCSVFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={csvImporting}
              style={{
                padding: '0.4rem 0.85rem',
                background: csvImporting ? '#f3f4f6' : '#eff6ff',
                color: csvImporting ? '#9ca3af' : '#667eea',
                border: '1px solid #bfdbfe',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: csvImporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Import holdings from a CSV file (Ticker,Shares)"
            >
              {csvImporting ? '⏳ Importing...' : '📂 Import CSV'}
            </button>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>
              Total Value: ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
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
          {existingPortfolio ? 'Update Portfolio →' : 'Analyze Portfolio →'}
        </Button>
      </div>
    </div>
  );
}
