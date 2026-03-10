import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { portfolio, metrics } = await request.json();

    const topSector: [string, number] = Object.entries(metrics.sectorConcentration)
      .reduce((max: [string, number], entry: [string, any]) =>
        entry[1] > max[1] ? [entry[0], entry[1]] : max
      , ['', 0]);

    const sectorBreakdown = Object.entries(metrics.sectorConcentration)
      .map(([s, w]) => `${s}: ${(w as number).toFixed(1)}%`)
      .join(', ');

    const holdingsList = portfolio.holdings
      .map((h: any) => `${h.ticker} (${(h.weight || 0).toFixed(1)}%)`)
      .join(', ');

    const prompt = `You are a concise financial risk analyst. Analyze this investment portfolio and provide specific, actionable insights in 3-4 sentences.

Portfolio: ${portfolio.name}
Holdings: ${holdingsList}
Total Value: $${(portfolio.totalValue || 0).toLocaleString()}
Risk Level: ${metrics.riskLevel}
Diversification Score: ${metrics.diversificationScore}/100
Top Sector: ${topSector[0]} at ${(topSector[1] as number).toFixed(1)}%
Sector Breakdown: ${sectorBreakdown}

Cover: (1) the main concentration risk, (2) how this historically affects portfolio volatility, (3) one specific rebalancing recommendation. Be direct and data-driven. No generic disclaimers.`;

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 350,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return NextResponse.json({ error: 'Groq API request failed' }, { status: 502 });
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content?.trim() || 'Unable to generate analysis.';

    return NextResponse.json({ narrative });
  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
  }
}
