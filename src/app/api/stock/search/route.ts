import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Yahoo Finance search API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    
    const results = (data.quotes || [])
      .filter((q: any) => q.quoteType === 'EQUITY') // Only stocks
      .map((q: any) => ({
        ticker: q.symbol,
        name: q.longname || q.shortname,
        exchange: q.exchange,
      }))
      .slice(0, 5);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ results: [] });
  }
}
