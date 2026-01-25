
import React, { useEffect, useState } from 'react';
import { getMotivationalQuote, getDailyBriefing } from '../services/geminiService';
import { DashboardHeader } from './DashboardHeader';
import { apiClient } from '../services/apiClient';
import { AppView } from '../types';

interface DashboardProps {
    onChangeView: (view: AppView) => void;
}

// Interfaces for cached data
interface DailyContent {
    date: string;
    quote: string;
    briefing: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
    const [quote, setQuote] = useState("Yuklanmoqda...");
    const [briefing, setBriefing] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await apiClient.getCurrentUser();
                if (response.success && response.user) {
                    setUser(response.user);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            }
        };
        loadUser();
    }, []);

    // Stats data (Mock data for display)
    const kpiStats = [
        { title: "Ijro Intizomi", value: "94%", change: "+2.5%", isGood: true, icon: "🎯", bg: "bg-emerald-50 text-emerald-700" },
        { title: "Kelib tushgan", value: "128", change: "Bugun", isGood: true, icon: "inbox", bg: "bg-blue-50 text-blue-700" },
        { title: "Ko'rib chiqilmoqda", value: "15", change: "-4 ta", isGood: false, icon: "clock", bg: "bg-orange-50 text-orange-700" },
        { title: "Imzolangan", value: "42", change: "Hafta davomida", isGood: true, icon: "signature", bg: "bg-purple-50 text-purple-700" },
    ];

    useEffect(() => {
        const loadDailyContent = async () => {
            const today = new Date().toDateString();
            const storageKey = `mirzo_daily_content_${user?.id || 'guest'}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                const parsed: DailyContent = JSON.parse(storedData);
                // Agar saqlangan ma'lumot bugungi sanaga tegishli bo'lsa, o'shani ishlatamiz
                if (parsed.date === today) {
                    setQuote(parsed.quote);
                    setBriefing(parsed.briefing);
                    setLoading(false);
                    return;
                }
            }

            // Agar bugun uchun ma'lumot yo'q bo'lsa, yangisini olamiz
            try {
                const [quoteResponse, briefingResponse] = await Promise.all([
                    getMotivationalQuote(),
                    user ? getDailyBriefing(user.organization || "Tashkilot") : Promise.resolve("")
                ]);

                const newQuote = typeof quoteResponse === 'string' ? quoteResponse : quoteResponse;
                const briefingText = typeof briefingResponse === 'string' ? briefingResponse : briefingResponse;
                
                const briefingItems = briefingText.split(/\n-|\n\*/).filter(i => i.trim().length > 10);
                const cleanBriefing = briefingItems.length > 0 ? briefingItems : [briefingText];

                // Save to cache
                const newData: DailyContent = {
                    date: today,
                    quote: newQuote,
                    briefing: cleanBriefing
                };
                localStorage.setItem(storageKey, JSON.stringify(newData));

                setQuote(newQuote);
                setBriefing(cleanBriefing);
            } catch (error) {
                console.error("Daily content fetch error:", error);
                setQuote("Muvaffaqiyat - bu har kuni qilingan kichik qadamlar yig'indisi.");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadDailyContent();
        }
    }, [user]);

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up pb-32">
            <DashboardHeader userName={user?.fullName} organization={user?.organization} />

            {/* KPI STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiStats.map((stat, idx) => (
                    <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow cursor-default">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${stat.bg}`}>
                                {stat.icon === 'inbox' ? '📥' : stat.icon === 'clock' ? '⏳' : stat.icon === 'signature' ? '✍️' : '🎯'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                            <div className={`inline-flex items-center gap-1 text-xs font-bold mt-1 px-2 py-0.5 rounded-md ${stat.isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* QUOTE OF THE DAY (Cached) */}
                    <div className="glass-panel rounded-3xl p-8 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-900/20">
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                            <div className="hidden md:flex flex-col items-center justify-center w-24 border-r border-white/10 pr-6">
                                <span className="text-5xl">💡</span>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-2 font-bold">Kun Hikmati</span>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-lg md:text-xl font-medium leading-relaxed font-serif italic opacity-90">
                                    "{quote}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI BRIEFING (Cached) */}
                    <div className="glass-panel rounded-3xl p-0 overflow-hidden border border-blue-100">
                        <div className="bg-blue-50/50 p-5 border-b border-blue-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Kunlik Strategik Dayjest
                            </h3>
                            <span className="text-xs font-bold text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                AI Tahlil
                            </span>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {briefing.map((item, idx) => (
                                        <li key={idx} className="flex gap-4 items-start group">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </span>
                                            <p className="text-slate-600 text-sm font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                                                {item.replace(/^\d+[\.\)]/, '').trim()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* QUICK ACCESS GRID */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Tezkor O'tish</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => onChangeView(AppView.DOC_GENERATOR)}
                                className="glass-panel p-4 rounded-2xl hover:bg-blue-50 transition-all group flex flex-col items-center gap-3 border hover:border-blue-200"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
                                <span className="font-bold text-sm text-slate-700">Yangi Hujjat</span>
                            </button>
                            <button 
                                onClick={() => onChangeView(AppView.DOC_GENERATOR)}
                                className="glass-panel p-4 rounded-2xl hover:bg-orange-50 transition-all group flex flex-col items-center gap-3 border hover:border-orange-200"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📊</div>
                                <span className="font-bold text-sm text-slate-700">Tahlil</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (1/3 width) */}
                <div className="space-y-6">
                    
                    {/* CALENDAR / TIME WIDGET */}
                    <div className="glass-panel rounded-3xl p-6 bg-gradient-to-b from-white to-blue-50/50">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-4xl font-bold text-slate-800 tracking-tighter">
                                    {new Date().getDate()}
                                </h4>
                                <p className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                                    {new Date().toLocaleDateString('uz-UZ', { month: 'long' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-800 font-bold">
                                    {new Date().toLocaleDateString('uz-UZ', { weekday: 'long' })}
                                </p>
                                <p className="text-xs text-blue-500 font-bold">Bugun</p>
                            </div>
                        </div>
                        <div className="h-px w-full bg-slate-200 mb-4"></div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-slate-600 flex-1">10:00 - Apparat yig'ilishi</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-slate-600 flex-1">14:00 - Fuqarolar qabuli</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-slate-600 flex-1">16:30 - Tahlil taqdimoti</span>
                            </div>
                        </div>
                    </div>

                    {/* SUPPORT CARD */}
                    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group cursor-pointer bg-slate-800 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Yordam kerakmi?</h3>
                            <p className="text-slate-400 text-xs mb-4">Texnik xizmat 24/7 ishlaydi</p>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors border border-white/10">
                                Bog'lanish
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
