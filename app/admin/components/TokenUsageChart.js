import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = [
  { name: 'Mon', groq: 4000, gemini: 2400 },
  { name: 'Tue', groq: 3000, gemini: 2210 },
  { name: 'Wed', groq: 2000, gemini: 2290 },
  { name: 'Thu', groq: 2780, gemini: 2000 },
  { name: 'Fri', groq: 1890, gemini: 2181 },
  { name: 'Sat', groq: 2390, gemini: 2500 },
  { name: 'Sun', groq: 3490, gemini: 2100 },
];

export default function TokenUsageChart() {
  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col h-[350px]">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Token Consumption (7D)</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }}
            />
            <Bar dataKey="groq" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="gemini" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
