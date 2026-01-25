
import React, { useState } from 'react';
import { User, AppView } from '../types';
import { apiClient } from '../services/apiClient';

interface SubscriptionProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onViewChange?: (view: AppView) => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ user, onUpdateUser, onViewChange }) => {
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Exchange rate: 1 USD = 12,500 UZS (can be updated dynamically)
    const exchangeRate = 12500;
    const usdPrice = 4.99;
    const uzsPrice = Math.round(usdPrice * exchangeRate);

    // Payment card
    const paymentCard = "9860 3566 2700 0702";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        if (!receiptFile) {
            alert("Iltimos, to'lov chekini yuklang.");
            return;
        }
        
        console.log('Submitting receipt:', receiptFile.name, receiptFile.size);
        setLoading(true);
        
        try {
            console.log('Calling apiClient.updateSubscription...');
            const response = await apiClient.updateSubscription(receiptFile);
            console.log('Response received:', response);
            
            if (response.success && response.user) {
                const updatedUser = {
                    id: response.user.id,
                    fullName: response.user.fullName,
                    phoneNumber: response.user.phoneNumber,
                    password: '',
                    organization: response.user.organization,
                    subscriptionStatus: response.user.subscriptionStatus,
                    subscriptionExpiry: response.user.subscriptionExpiry,
                    history: [],
                    isAdmin: response.user.isAdmin || false
                };
                onUpdateUser(updatedUser);
                
                // Always redirect to pending subscription page if status is PENDING
                if (response.user.subscriptionStatus === 'PENDING') {
                    if (onViewChange) {
                        // Small delay to ensure state is updated
                        setTimeout(() => {
                            onViewChange(AppView.PENDING_SUBSCRIPTION);
                        }, 100);
                    }
                } else {
                    alert("Chek muvaffaqiyatli yuklandi! Administratorlar tez orada tasdiqlaydi.");
                }
            } else {
                const errorMsg = response.error || "To'lov chekini yuklashda xatolik";
                console.error('Error response:', errorMsg);
                alert("Xatolik: " + errorMsg);
            }
        } catch (error: any) {
            console.error('Exception caught:', error);
            const errorMsg = error.response?.data?.error || error.message || "To'lov chekini yuklashda xatolik";
            alert("Xatolik: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };
    
    const getDaysRemaining = () => {
        if (!user.subscriptionExpiry) return 0;
        const now = new Date();
        const expiry = new Date(user.subscriptionExpiry);
        const diffTime = expiry.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysRemaining();
    const isExpiring = daysLeft <= 3 && daysLeft >= 0;

    if (user.subscriptionStatus === 'ACTIVE') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className={`glass-panel p-8 rounded-3xl text-center transition-colors ${isExpiring ? 'border-2 border-red-400 bg-red-50/50' : ''}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isExpiring ? 'bg-red-100 animate-pulse' : 'bg-green-100'}`}>
                        <span className="text-4xl">{isExpiring ? '⚠️' : '✅'}</span>
                    </div>
                    <h2 className={`text-3xl font-bold mb-2 ${isExpiring ? 'text-red-700' : 'text-slate-800'}`}>
                        {isExpiring ? 'Obuna tugamoqda!' : 'Obuna Faol'}
                    </h2>
                    <p className="text-slate-500 mb-6">
                        {isExpiring 
                             ? `Diqqat! Obunangiz tugashiga atigi ${daysLeft} kun qoldi. Iltimos, uzluksiz foydalanish uchun hisobni to'ldiring.`
                             : 'Siz barcha xizmatlardan cheklovsiz foydalanishingiz mumkin.'}
                    </p>
                    
                    <div className={`inline-block px-6 py-3 rounded-xl border ${isExpiring ? 'bg-red-100 border-red-300' : 'bg-white border-green-200'}`}>
                        <p className="text-sm text-slate-400 uppercase font-bold">Amal qilish muddati</p>
                        <p className={`text-xl font-bold ${isExpiring ? 'text-red-600' : 'text-green-600'}`}>
                            {user.subscriptionExpiry ? new Date(user.subscriptionExpiry).toLocaleDateString() : 'Noma\'lum'}
                        </p>
                    </div>

                    {/* Show payment form again if expiring? For now just warning as system is simple */}
                    {isExpiring && (
                         <div className="mt-8 p-4 bg-white/60 rounded-xl text-sm text-red-600 font-medium">
                             Obunani uzaytirish uchun administratorga murojaat qiling yoki muddati tugagach qayta to'lov qiling.
                         </div>
                    )}
                </div>
            </div>
        );
    }

    if (user.subscriptionStatus === 'PENDING') {
        // Redirect to pending subscription page if available
        if (onViewChange) {
            onViewChange(AppView.PENDING_SUBSCRIPTION);
            return null;
        }
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="glass-panel p-8 rounded-3xl text-center">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <span className="text-4xl">⏳</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Tekshirilmoqda...</h2>
                    <p className="text-slate-500 mb-6">Sizning to'lov chekingiz qabul qilindi. Administratorlar uni tasdiqlashini kuting. Odatda bu 15-30 daqiqa vaqt oladi.</p>
                    
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="glass-panel rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-2">Premium Obunani Faollashtirish</h2>
                    <p className="opacity-80">Barcha sun'iy intellekt imkoniyatlaridan cheklovsiz foydalaning.</p>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Info Side */}
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Tarif: "Professional"</h3>
                            <div className="space-y-2 mb-3">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-blue-600">${usdPrice.toFixed(2)}</span>
                                    <span className="text-slate-500 font-medium">/ oyiga</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-700">{uzsPrice.toLocaleString('uz-UZ')}</span>
                                    <span className="text-slate-500 font-medium text-sm">so'm / oyiga</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1 pt-2 border-t border-blue-200">
                                    💱 Kurs: 1 USD = {exchangeRate.toLocaleString('uz-UZ')} UZS
                                </div>
                            </div>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2">✅ Barcha turdagi hujjatlarni yaratish</li>
                                <li className="flex items-center gap-2">✅ Cheksiz AI Chat yordamchisi</li>
                                <li className="flex items-center gap-2">✅ Video generatsiya (Veo)</li>
                                <li className="flex items-center gap-2">✅ Rasm va Fayllar tahlili</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-700 mb-3">To'lov uchun karta:</h4>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-lg font-bold text-slate-800">{paymentCard}</span>
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(paymentCard.replace(/\s/g, ''));
                                            alert('Karta raqami nusxalandi!');
                                        }}
                                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    >
                                        📋 Nusxa olish
                                    </button>
                                </div>
                                <p className="text-xs text-slate-600 mt-2">
                                    <span className="font-semibold text-red-600">* Muhim:</span> To'lov qilganda izohga <span className="font-bold">Ism Familiyangizni</span> yozib qoldiring.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Side */}
                    <div className="flex flex-col justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Chekni yuklash</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Istalgan ilova (Click, Payme, Uzum) orqali to'lovni amalga oshiring va chekni (skrinshot) bu yerga yuklang.
                        </p>

                        <label className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors bg-white/50 mb-6">
                            <span className="text-4xl mb-2">🧾</span>
                            <span className="text-sm font-bold text-slate-600">
                                {receiptFile ? receiptFile.name : "Chekni tanlash uchun bosing"}
                            </span>
                            <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
                        </label>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Button clicked, receiptFile:', receiptFile);
                                handleSubmit(e);
                            }}
                            disabled={loading || !receiptFile}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                                loading || !receiptFile 
                                ? 'bg-slate-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-600 shadow-green-500/30 active:scale-95'
                            }`}
                        >
                            {loading ? "Jo'natilmoqda..." : "Tasdiqlash uchun yuborish"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
