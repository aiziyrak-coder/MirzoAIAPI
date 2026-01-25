
import React from 'react';
import { AppView, SubscriptionStatus } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  subscriptionStatus: SubscriptionStatus;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, subscriptionStatus, onLogout }) => {
  const isLocked = subscriptionStatus !== 'ACTIVE';

  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Asosiy', locked: isLocked, icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { id: AppView.DOC_GENERATOR, label: 'Hujjatlar', locked: isLocked, icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
  ];

  const bottomItems = [
    { id: AppView.PROFILE, label: 'Mening Profilim', locked: false, icon: '👤' },
    { id: AppView.SUBSCRIPTION, label: 'Obuna', locked: false, icon: '💳' },
  ];

  return (
    <div className="w-24 lg:w-72 h-screen fixed left-0 top-0 z-50 p-4 flex flex-col gap-6">
      {/* Logo Area */}
      <div className="glass-panel rounded-3xl p-4 flex items-center justify-center lg:justify-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
          M
        </div>
        <div className="hidden lg:block">
          <h1 className="font-bold text-slate-800 text-lg leading-tight">Mirzo AI</h1>
          <p className="text-xs text-slate-500">Raqamli Davlat Kotibi</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="glass-panel rounded-3xl flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 relative z-10 ${
                isActive ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-transparent group-hover:scale-110'
              }`}>
                {item.icon}
              </div>
              <span className={`hidden lg:block font-medium relative z-10 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              
              {item.locked && (
                  <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] flex items-center justify-end pr-4 z-20">
                      <span className="text-slate-400">🔒</span>
                  </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom User/Sub Links + Logout */}
      <div className="glass-panel rounded-3xl p-2 flex flex-col gap-1">
          {bottomItems.map(item => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                     currentView === item.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden lg:block text-sm font-bold">{item.label}</span>
                  {item.id === AppView.SUBSCRIPTION && isLocked && (
                      <span className="hidden lg:block ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
              </button>
          ))}
          
          {/* Logout Button in Sidebar */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-red-500 hover:bg-red-50 hover:text-red-600 mt-1 border-t border-slate-100"
          >
              <span className="text-lg">🚪</span>
              <span className="hidden lg:block text-sm font-bold">Chiqish</span>
          </button>
      </div>

      {/* Footer Info (Updated for 2026 - Dark Text for Light Background) */}
      <div className="hidden lg:block mt-auto">
          <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-500 border border-white/60">
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  
                  {/* Developer Section */}
                  <div className="w-full group/dev">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1.5 transition-colors group-hover/dev:text-blue-600">Developed by</p>
                      <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 hover:bg-white border border-slate-200 hover:border-blue-200 transition-all duration-300 group-hover/dev:scale-105 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          <span className="text-sm font-extrabold text-slate-800 group-hover:text-blue-700">
                              CDCGroup
                          </span>
                      </a>
                  </div>

                  {/* Subtle Divider */}
                  <div className="w-16 h-px bg-slate-300"></div>

                  {/* Supporter Section */}
                  <div className="w-full group/supp">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-1.5 transition-colors group-hover/supp:text-purple-600">Supported by</p>
                      <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="inline-block transition-transform duration-300 hover:scale-105">
                          <span className="text-sm font-bold text-slate-800 hover:text-purple-600">
                              CraDev Company
                          </span>
                      </a>
                  </div>

                  {/* Copyright - Made darker (slate-500) for visibility on white glass */}
                  <div className="text-[10px] text-slate-500 font-bold pt-2">
                      © 2026 Mirzo AI Platform
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
