'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SECTOR_COLORS } from '@/lib/sampleData';

interface SectorBreakdownProps {
  sectorConcentration: { [sector: string]: number };
}

export default function SectorBreakdown({ sectorConcentration }: SectorBreakdownProps) {
  const data = Object.entries(sectorConcentration).map(([sector, percentage]) => ({
    name: sector,
    value: percentage,
  }));

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value.toFixed(0)}%`;
  };

  const formatTooltip = (value: any) => {
    return `${Number(value).toFixed(1)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Allocation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SECTOR_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={formatTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
