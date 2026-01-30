import { NextResponse } from 'next/server';
import { SECTOR_MAP } from '@/lib/constants/sectors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ticker}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    
    if (!data.quoteResponse?.result?.[0]) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const stock = data.quoteResponse.result[0];

    return NextResponse.json({
      ticker: stock.symbol,
      name: stock.longName || stock.shortName,
      price: stock.regularMarketPrice || 0,
      sector: SECTOR_MAP[stock.sector] || stock.sector || 'Technology',
    });
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
