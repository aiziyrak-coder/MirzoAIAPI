
import React, { useState } from 'react';
import { User, DocumentType } from '../types';
import { UserGuide } from './UserGuide';

interface UserProfileProps {
    user: User;
    onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
    const [showGuide, setShowGuide] = useState(false);
    
    const getDaysRemaining = () => {
        if (!user.subscriptionExpiry) return 0;
        const now = new Date();
        const expiry = new Date(user.subscriptionExpiry);
        const diffTime = expiry.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysRemaining();
    const isExpiring = daysLeft <= 3 && daysLeft >= 0;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header Info */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-4xl shadow-inner border-4 border-white">
                    👤
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-slate-800">{user.fullName}</h1>
                    <p className="text-slate-500 font-medium">{user.organization}</p>
                    <p className="text-sm text-slate-400 mt-1 font-mono">{user.phoneNumber}</p>
                </div>

                <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className={`px-4 py-2 rounded-xl text-center border font-bold text-sm transition-all ${
                        user.subscriptionStatus === 'ACTIVE' 
                        ? (isExpiring ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : 'bg-green-50 text-green-700 border-green-200')
                        : user.subscriptionStatus === 'PENDING'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {user.subscriptionStatus === 'ACTIVE' 
                            ? (isExpiring ? `⚠️ TUGASHIGA ${daysLeft} KUN QOLDI` : 'PREMIUM (FAOL)') 
                            : user.subscriptionStatus === 'PENDING' ? 'KUTILMOQDA' : 'ODDIY (OBUNASIZ)'}
                    </div>
                    {user.subscriptionStatus === 'ACTIVE' && (
                        <p className={`text-xs text-center font-medium ${isExpiring ? 'text-red-500' : 'text-slate-400'}`}>
                            Amal qilish muddati: {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : ''}
                        </p>
                    )}
                    
                    <button 
                        onClick={() => setShowGuide(true)}
                        className="w-full py-3 bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 border border-blue-200 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                        📚 Qanday Foydalanaman?
                    </button>
                    <button 
                        onClick={onLogout}
                        className="w-full py-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-200 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-red-500/30 flex items-center justify-center gap-2"
                    >
                        🚪 Tizimdan Chiqish
                    </button>
                </div>
            </div>

            {/* Document History */}
            <div className="glass-panel p-6 rounded-3xl min-h-[500px]">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-lg">📂</span>
                    Mening Hujjatlarim
                </h2>

                {user.history.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <span className="text-6xl block mb-4 opacity-30">📭</span>
                        <p>Hozircha saqlangan hujjatlar yo'q.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user.history.map((doc) => (
                            <div key={doc.id} className="bg-white/60 p-5 rounded-2xl border border-white/60 hover:shadow-lg transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase">
                                        {doc.type}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">
                                        {new Date(doc.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 min-h-[3rem]">
                                    {doc.title}
                                </h3>
                                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                    <button 
                                        onClick={() => {
                                            const win = window.open('', '_blank');
                                            if(win) win.document.write(doc.content);
                                        }}
                                        className="text-sm text-blue-600 hover:underline font-medium"
                                    >
                                        Ko'rish
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* User Guide Modal */}
            {showGuide && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <UserGuide onClose={() => setShowGuide(false)} />
                </div>
            )}
        </div>
    );
};
