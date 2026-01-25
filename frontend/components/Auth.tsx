
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
    onBack: () => void; // Added onBack prop
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [organization, setOrganization] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminSecret, setAdminSecret] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Remove all non-digit characters and limit to 9 digits
        const cleaned = value.replace(/\D/g, '').slice(0, 9);
        // Store with +998 prefix for validation and API calls
        setPhoneNumber('+998' + cleaned);
    };

    const validatePhoneNumber = (phone: string): boolean => {
        const cleaned = phone.replace(/\s|-|\(|\)|\+/g, '');
        return /^9989\d{8}$/.test(cleaned);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            if (isLogin) {
                // Admin login check
                if (showAdminLogin) {
                    if (!adminSecret) {
                        setError("Admin parolini kiriting.");
                        return;
                    }
                    const user = await authService.loginAsAdmin(adminSecret);
                    onLogin(user);
                    return;
                }
                
                // Regular login
                if (!phoneNumber || !password) {
                    setError("Telefon raqam va parolni kiriting.");
                    return;
                }
                const finalPhone = phoneNumber.startsWith('+998') ? phoneNumber : '+998' + phoneNumber.replace(/\D/g, '');
                const user = await authService.login(finalPhone, password);
                onLogin(user);
            } else {
                // Registration validation
                if (!fullName || !organization || !phoneNumber || !password || !password2) {
                    setError("Barcha maydonlarni to'ldiring.");
                    return;
                }

                if (password.length < 6) {
                    setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
                    return;
                }

                if (password !== password2) {
                    setError("Parollar mos kelmadi.");
                    return;
                }

                // Ensure phone number has +998 prefix
                const finalPhone = phoneNumber.startsWith('+998') ? phoneNumber : '+998' + phoneNumber.replace(/\D/g, '');
                
                if (!validatePhoneNumber(finalPhone)) {
                    setError("Telefon raqami noto'g'ri formatda. 9 raqam kiriting (masalan: 901234567)");
                    return;
                }

                const user = await authService.register(fullName, finalPhone, password, organization);
                onLogin(user);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error;
            if (typeof errorMessage === 'object') {
                const firstError = Object.values(errorMessage)[0];
                setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
            } else {
                setError(errorMessage || err.message || 'Xatolik yuz berdi');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in-up">
            <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative overflow-hidden">
                {/* Back Button */}
                <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 p-2 rounded-full bg-white/50 hover:bg-white text-slate-500 hover:text-slate-800 transition-all z-20"
                    title="Bosh sahifaga qaytish"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>

                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full"></div>

                <div className="text-center mb-8 relative z-10 pt-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-blue-500/30 text-white">
                        M
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Mirzo AI</h1>
                    <p className="text-slate-500 text-sm">Raqamli Davlat Kotibi</p>
                </div>

                <h2 className="text-xl font-bold mb-6 text-slate-700 relative z-10 text-center">
                    {isLogin ? (showAdminLogin ? "Admin kirish" : "Tizimga kirish") : "Ro'yxatdan o'tish"}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    {isLogin && showAdminLogin && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                Admin Parol <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="password" 
                                required
                                value={adminSecret}
                                onChange={e => setAdminSecret(e.target.value)}
                                placeholder="Admin parolini kiriting"
                                autoComplete="off"
                                className="w-full p-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder-slate-400 font-bold"
                            />
                        </div>
                    )}
                    
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">F.I.SH</label>
                                <input 
                                    type="text" 
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Ism Familiya"
                                    autoComplete="off"
                                    className="w-full p-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder-slate-400 font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tashkilot nomi</label>
                                <input 
                                    type="text" 
                                    required
                                    value={organization}
                                    onChange={e => setOrganization(e.target.value)}
                                    placeholder="Tashkilot nomi"
                                    autoComplete="off"
                                    className="w-full p-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder-slate-400 font-bold"
                                />
                            </div>
                        </>
                    )}

                    {!showAdminLogin && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Telefon Raqam <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+998</span>
                                    <input 
                                        type="tel" 
                                        required={!showAdminLogin}
                                        value={phoneNumber.replace('+998', '')}
                                        onChange={handlePhoneChange}
                                        placeholder="901234567"
                                        autoComplete="off"
                                        maxLength={9}
                                        className="w-full p-3 pl-16 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder-slate-400 font-bold"
                                    />
                                </div>
                                {!isLogin && phoneNumber && !validatePhoneNumber(phoneNumber) && (
                                    <p className="text-xs text-red-500 mt-1">Telefon raqam 9 raqamdan iborat bo'lishi kerak (998 dan keyin)</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Parol <span className="text-red-500">*</span>
                                    {!isLogin && <span className="text-slate-400 text-xs normal-case ml-2">(kamida 6 belgi)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    required={!showAdminLogin}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={isLogin ? "Parol" : "Kamida 6 belgi"}
                                    autoComplete="new-password"
                                    className="w-full p-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder-slate-400 font-bold"
                                />
                                {!isLogin && password && password.length < 6 && (
                                    <p className="text-xs text-red-500 mt-1">Parol kamida 6 belgidan iborat bo'lishi kerak</p>
                                )}
                            </div>
                        </>
                    )}

                        {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                Parolni Tasdiqlash <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="password" 
                                required
                                value={password2}
                                onChange={e => setPassword2(e.target.value)}
                                placeholder="Parolni qayta kiriting"
                                autoComplete="new-password"
                                className="w-full p-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder-slate-400 font-bold"
                            />
                            {password2 && password !== password2 && (
                                <p className="text-xs text-red-500 mt-1">Parollar mos kelmadi</p>
                            )}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:brightness-110 transition-all active:scale-95"
                    >
                        {isLogin ? "Kirish" : "Ro'yxatdan o'tish"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm relative z-10 space-y-2">
                    {isLogin && (
                        <button 
                            onClick={() => {
                                setShowAdminLogin(!showAdminLogin);
                                setPhoneNumber('');
                                setPassword('');
                                setAdminSecret('');
                                setError('');
                            }}
                            className="text-xs text-slate-400 hover:text-blue-600 font-medium"
                        >
                            {showAdminLogin ? "← Oddiy kirish" : "Admin kirish"}
                        </button>
                    )}
                    <p className="text-slate-500">
                        {isLogin ? "Hali hisobingiz yo'qmi?" : "Hisobingiz bormi?"}
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setPhoneNumber('');
                                setPassword('');
                                setPassword2('');
                                setFullName('');
                                setOrganization('');
                                setShowAdminLogin(false);
                                setAdminSecret('');
                                setError('');
                            }}
                            className="ml-2 font-bold text-blue-600 hover:underline"
                        >
                            {isLogin ? "Ro'yxatdan o'ting" : "Kiring"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
