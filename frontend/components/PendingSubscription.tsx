import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';

interface PendingSubscriptionProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onBack?: () => void;
}

export const PendingSubscription: React.FC<PendingSubscriptionProps> = ({ user, onUpdateUser, onBack }) => {
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const [isExpired, setIsExpired] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const adminPhone = '+998948788878';

    // Countdown timer
    useEffect(() => {
        if (timeRemaining <= 0) {
            setIsExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining]);

    // Poll for subscription status
    useEffect(() => {
        const checkStatus = async () => {
            try {
                setIsChecking(true);
                const currentUser = await apiClient.getCurrentUser();
                if (currentUser && currentUser.user) {
                    const updatedUser = currentUser.user;
                    
                    if (updatedUser.subscriptionStatus === 'ACTIVE') {
                        setIsApproved(true);
                        onUpdateUser({
                            id: updatedUser.id,
                            fullName: updatedUser.fullName,
                            phoneNumber: updatedUser.phoneNumber,
                            password: '',
                            organization: updatedUser.organization,
                            subscriptionStatus: updatedUser.subscriptionStatus,
                            subscriptionExpiry: updatedUser.subscriptionExpiry,
                            history: [],
                            isAdmin: updatedUser.isAdmin || false
                        });
                    } else if (updatedUser.subscriptionStatus === 'NONE') {
                        // Rejected
                        setIsExpired(true);
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error);
            } finally {
                setIsChecking(false);
            }
        };

        // Check immediately
        checkStatus();

        // Poll every 5 seconds
        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);
    }, [onUpdateUser]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCallAdmin = () => {
        window.location.href = `tel:${adminPhone}`;
    };

    const handleWhatsAppAdmin = () => {
        const message = encodeURIComponent(`Salom! Men to'lov chekini yuborganman va tasdiqlanishini kutmoqdaman. Iltimos, tekshirib ko'ring.`);
        window.open(`https://wa.me/998948788878?text=${message}`, '_blank');
    };

    if (isApproved) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
                <div className="max-w-2xl w-full glass-panel p-8 md:p-12 rounded-3xl text-center animate-fade-in-up">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce shadow-2xl shadow-green-500/30">
                        <span className="text-6xl">🎉</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
                        Tabriklaymiz! 🎊
                    </h1>
                    
                    <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                        To'lovingiz <span className="font-bold text-green-600">muvaffaqiyatli tasdiqlandi</span> va Premium obunangiz faollashtirildi!
                    </p>
                    
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl mb-8 border-2 border-green-200">
                        <p className="text-lg font-bold text-slate-700 mb-2">
                            ✅ Barcha xizmatlar endi sizning uchun ochiq!
                        </p>
                        <p className="text-slate-600">
                            Hujjatlar yaratish, AI yordamchisi, video generatsiya va boshqa barcha imkoniyatlardan bemalol foydalanishingiz mumkin.
                        </p>
                    </div>

                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform text-lg"
                        >
                            Davom etish →
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
            <div className="max-w-2xl w-full glass-panel p-8 md:p-12 rounded-3xl animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-xl shadow-yellow-500/30">
                        <span className="text-5xl">⏳</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
                        To'lov Tekshirilmoqda
                    </h1>
                    
                    <p className="text-lg text-slate-600 leading-relaxed">
                        To'lov chekingiz qabul qilindi va administratorlar tomonidan tekshirilmoqda. 
                        <span className="font-semibold text-blue-600"> Iltimos, biroz sabr qiling.</span>
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border-2 border-blue-200">
                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-2 font-medium uppercase tracking-wide">
                            {isExpired ? 'Vaqt tugadi' : 'Kutilayotgan vaqt'}
                        </p>
                        <div className={`text-5xl md:text-6xl font-mono font-bold mb-2 ${isExpired ? 'text-red-500' : 'text-blue-600'}`}>
                            {formatTime(timeRemaining)}
                        </div>
                        <p className="text-sm text-slate-500">
                            {isExpired 
                                ? '10 daqiqa o\'tdi. Iltimos, administrator bilan bog\'laning.' 
                                : 'Odatda bu 5-10 daqiqa vaqt oladi'}
                        </p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full ${isChecking ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <p className="text-sm text-slate-600 font-medium">
                        {isChecking ? 'Holat tekshirilmoqda...' : 'Avtomatik tekshirilmoqda'}
                    </p>
                </div>

                {/* Admin Contact Section - Always Visible */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-3 text-center">
                        📞 Bog'lanish uchun
                    </h3>
                    <p className="text-slate-600 text-center mb-4">
                        Savollar bo'lsa yoki tezkor javob kerak bo'lsa, administrator bilan bog'laning:
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <button
                            onClick={handleCallAdmin}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                        >
                            <span className="text-xl">📞</span>
                            Qo'ng'iroq qilish
                        </button>
                        
                        <button
                            onClick={handleWhatsAppAdmin}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                        >
                            <span className="text-xl">💬</span>
                            WhatsApp
                        </button>
                    </div>
                    
                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-1">
                            Telefon raqami:
                        </p>
                        <a 
                            href={`tel:${adminPhone}`}
                            className="text-xl font-bold text-blue-600 hover:text-blue-700 underline"
                        >
                            {adminPhone}
                        </a>
                    </div>
                </div>

                {/* Admin Contact Section - Expired Warning */}
                {isExpired && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl mb-6 border-2 border-red-200 animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 text-center">
                            ⚠️ 10 daqiqa o'tdi
                        </h3>
                        <p className="text-slate-600 text-center mb-4">
                            Agar hali ham tasdiqlanmagan bo'lsa, iltimos administrator bilan bog'laning:
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleCallAdmin}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                            >
                                <span className="text-xl">📞</span>
                                Qo'ng'iroq qilish
                            </button>
                            
                            <button
                                onClick={handleWhatsAppAdmin}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                            >
                                <span className="text-xl">💬</span>
                                WhatsApp
                            </button>
                        </div>
                        
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-500">
                                Yoki to'g'ridan-to'g'ri: <span className="font-bold text-blue-600">{adminPhone}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/60 p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📋</span>
                            <h3 className="font-bold text-slate-800">Nima bo'lyapti?</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Administratorlar to'lov chekingizni tekshirib, tasdiqlash yoki rad etish qarorini qabul qilmoqdalar.
                        </p>
                    </div>
                    
                    <div className="bg-white/60 p-5 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">⚡</span>
                            <h3 className="font-bold text-slate-800">Qancha vaqt?</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Odatda bu jarayon 5-10 daqiqa davom etadi. Tasdiqlangandan so'ng avtomatik xabar beriladi.
                        </p>
                    </div>
                </div>

                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className="w-full py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        ← Orqaga qaytish
                    </button>
                )}
            </div>
        </div>
    );
};
