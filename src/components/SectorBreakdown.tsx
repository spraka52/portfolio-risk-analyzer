'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SECTOR_COLORS } from '@/lib/sampleData';

export default function SectorBreakdown({ sectorConcentration }: { sectorConcentration: { [sector: string]: number } }) {
  const data = Object.entries(sectorConcentration).map(([sector, percentage]) => ({
    name: sector,
    value: percentage,
  }));

  const renderLabel = (entry: any) => {
    if (entry.value < 5) return '';
    return `${entry.value.toFixed(0)}%`;
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '1rem', 
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
        padding: '1.5rem', 
        color: 'white' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>📊</span>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Sector Allocation</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Portfolio distribution across sectors</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '1.5rem' }}>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SECTOR_COLORS[entry.name] || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `${Number(value).toFixed(1)}%`}
              contentStyle={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
