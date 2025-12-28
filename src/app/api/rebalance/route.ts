import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { portfolio, metrics } = await request.json();

    const sectorBreakdown = Object.entries(metrics.sectorConcentration)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([s, w]) => `${s}: ${(w as number).toFixed(1)}%`)
      .join(', ');

    const holdingsList = portfolio.holdings
      .sort((a: any, b: any) => (b.weight ?? 0) - (a.weight ?? 0))
      .map((h: any) => `${h.ticker} (${(h.weight ?? 0).toFixed(1)}% / $${((h.value ?? 0)).toLocaleString()})`)
      .join(', ');

    const prompt = `You are a portfolio rebalancing advisor. Based on the portfolio below, provide 4-6 SPECIFIC, actionable rebalancing steps. Each step must reference actual tickers and percentages.

Portfolio: ${portfolio.name}
Risk Level: ${metrics.riskLevel}
Diversification Score: ${metrics.diversificationScore}/100
Holdings: ${holdingsList}
Sector Breakdown: ${sectorBreakdown}

Respond with ONLY a JSON array (no prose, no markdown, no code fences). Each item must have:
- "action": "REDUCE" | "INCREASE" | "ADD" | "REMOVE"
- "ticker": the ticker symbol (or sector name if adding a new type)
- "detail": one specific sentence: what to do and why (e.g. "Trim AAPL from 32% to ~20% — tech concentration exceeds safe threshold")
- "priority": "HIGH" | "MEDIUM" | "LOW"

Example:
[{"action":"REDUCE","ticker":"AAPL","detail":"Trim AAPL from 32% to 20% to reduce tech overweight","priority":"HIGH"}]`;

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
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Groq API request failed' }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '[]';

    // Parse the JSON array from the response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Rebalance error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
