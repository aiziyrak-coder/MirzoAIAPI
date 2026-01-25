
import React, { useState, useEffect } from 'react';

interface StatItem {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface DashboardHeaderProps {
  userName?: string;
  organization?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName = 'Rahbar', 
  organization = 'Hokimiyat'
}) => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
    <div className="space-y-6">
      {/* Top Info Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-slate-800 text-white p-4 rounded-2xl shadow-lg shadow-slate-900/10">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                  <span className="text-2xl">🏛️</span>
              </div>
              <div>
                  <h2 className="font-bold text-lg leading-tight">{organization}</h2>
                  <p className="text-xs text-slate-400">Raqamli Boshqaruv Tizimi</p>
              </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-medium">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <span>⛅ +24°C</span>
                  <span className="text-slate-400">Toshkent</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-green-400">USD</span>
                  <span>12,850</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-blue-400">EUR</span>
                  <span>13,900</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg shadow-blue-500/50">
                  <span>📅 {date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}</span>
                  <span className="opacity-50">|</span>
                  <span>{date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
          </div>
      </div>
      
      {/* Welcome Section */}
      <div className="flex justify-between items-end px-2">
          <div>
              <p className="text-slate-500 font-medium mb-1">Xayrli kun,</p>
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight">{userName}</h1>
          </div>
      </div>
    </div>
  );
};
