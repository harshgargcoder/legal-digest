import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  success: Math.floor(Math.random() * 50) + 100,
  failure: Math.floor(Math.random() * 10),
}));

export default function ApiHealthChart() {
  return (
    <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col h-[350px]">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">API Reliability (24H)</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
              interval={4}
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
            <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="failure" stroke="#f43f5e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
