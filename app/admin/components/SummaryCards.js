import React from 'react';
import { Users, Play, Zap, Activity, DollarSign } from 'lucide-react';

export default function SummaryCards({ stats }) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      badge: `+${stats.newSignups7d} 7D`,
      icon: <Users className="text-blue-500" size={20} />,
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Daily Active Users",
      value: stats.dailyActiveUsers,
      footer: "Unique starters today",
      icon: <Activity className="text-green-500" size={20} />,
      bgColor: "bg-green-500/10"
    },
    {
      title: "Moot Sessions",
      value: `${stats.sessionsToday.started} / ${stats.sessionsToday.completed}`,
      footer: "Started vs Completed",
      icon: <Play className="text-purple-500" size={20} />,
      bgColor: "bg-purple-500/10"
    },
    {
      title: "API Calls Today",
      value: `${stats.apiCallsToday.success} / ${stats.apiCallsToday.failure}`,
      footer: "Success / Failure",
      icon: <Zap className="text-amber-500" size={20} />,
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Token Cost Today",
      value: stats.tokensToday.toLocaleString(),
      badge: `$${stats.estimatedCost.toFixed(4)}`,
      icon: <DollarSign className="text-emerald-500" size={20} />,
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex flex-col relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${card.bgColor} transition-transform group-hover:scale-110`}>
              {card.icon}
            </div>
            {card.badge && (
              <span className="text-[10px] font-black bg-indigo-600/20 text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-widest">
                {card.badge}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
          <h4 className="text-2xl font-black text-white">{card.value}</h4>
          {card.footer && <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{card.footer}</p>}
        </div>
      ))}
    </div>
  );
}
