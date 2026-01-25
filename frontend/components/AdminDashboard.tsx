
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/apiClient';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState({ pendingCount: 0, activeCount: 0, totalEarnings: 0 });
    const [filter, setFilter] = useState<'ALL' | 'PENDING'>('PENDING');
    const [loading, setLoading] = useState(true);
    const [showApiKeySettings, setShowApiKeySettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiKeyMasked, setApiKeyMasked] = useState('');
    const [apiKeyLoading, setApiKeyLoading] = useState(false);
    const [apiKeyUpdated, setApiKeyUpdated] = useState<string | null>(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userFormData, setUserFormData] = useState({
        fullName: '',
        phoneNumber: '',
        password: '',
        organization: '',
        subscriptionStatus: 'NONE' as 'NONE' | 'PENDING' | 'ACTIVE',
        isAdmin: false,
        isActive: true
    });
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [receiptLoading, setReceiptLoading] = useState(false);

    useEffect(() => {
        loadUsers();
        loadStats();
        loadApiKey();
    }, []);

    const loadApiKey = async () => {
        try {
            const response = await apiClient.getGeminiApiKey();
            if (response.success) {
                setApiKeyMasked(response.api_key_masked || '');
                setApiKeyUpdated(response.updated_at || null);
            }
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    };

    const handleUpdateApiKey = async () => {
        if (!apiKey.trim()) {
            alert("Iltimos, API key kiriting!");
            return;
        }

        if (!confirm("Gemini API keyni yangilashni tasdiqlaysizmi?")) {
            return;
        }

        try {
            setApiKeyLoading(true);
            const response = await apiClient.updateGeminiApiKey(apiKey.trim());
            if (response.success) {
                alert("API key muvaffaqiyatli yangilandi!");
                setApiKey('');
                await loadApiKey();
                setShowApiKeySettings(false);
            } else {
                alert('Xatolik: ' + (response.error || 'API keyni yangilashda xatolik'));
            }
        } catch (error: any) {
            alert('Xatolik: ' + (error.message || 'API keyni yangilashda xatolik'));
        } finally {
            setApiKeyLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getAllUsers();
            if (response.success) {
                setUsers(response.users.map(u => ({
                    id: u.id,
                    fullName: u.fullName,
                    phoneNumber: u.phoneNumber,
                    password: '',
                    organization: u.organization,
                    subscriptionStatus: u.subscriptionStatus,
                    subscriptionExpiry: u.subscriptionExpiry,
                    history: [],
                    isAdmin: u.isAdmin || false,
                    receiptFileName: u.receiptFileName || undefined
                })));
            }
        } catch (error: any) {
            alert('Xatolik: ' + (error.message || 'Foydalanuvchilarni yuklashda xatolik'));
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await apiClient.getAdminStats();
            if (response.success && response.stats) {
                // Backend returns snake_case, convert to camelCase
                const stats = response.stats;
                setStats({
                    pendingCount: stats.pending_count || stats.pendingCount || 0,
                    activeCount: stats.active_subscription_count || stats.activeCount || 0,
                    totalEarnings: stats.total_earnings || stats.totalEarnings || 0
                });
            } else {
                // Set default stats if no response
                setStats({ pendingCount: 0, activeCount: 0, totalEarnings: 0 });
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Set default stats on error
            setStats({ pendingCount: 0, activeCount: 0, totalEarnings: 0 });
        }
    };

    const handleStatusChange = async (userId: string, status: 'ACTIVE' | 'NONE') => {
        if (confirm(`Foydalanuvchi statusini ${status} ga o'zgartirishni tasdiqlaysizmi?`)) {
            try {
                const response = await apiClient.updateUserSubscription(userId, status);
                if (response.success) {
                    await loadUsers();
                    await loadStats();
                } else {
                    alert('Xatolik: ' + response.error);
                }
            } catch (error: any) {
                alert('Xatolik: ' + (error.message || 'Statusni yangilashda xatolik'));
            }
        }
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setUserFormData({
            fullName: '',
            phoneNumber: '',
            password: '',
            organization: '',
            subscriptionStatus: 'NONE',
            isAdmin: false,
            isActive: true
        });
        setShowUserForm(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserFormData({
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            password: '',
            organization: user.organization,
            subscriptionStatus: user.subscriptionStatus as 'NONE' | 'PENDING' | 'ACTIVE',
            isAdmin: user.isAdmin || false,
            isActive: true
        });
        setShowUserForm(true);
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`"${userName}" foydalanuvchisini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi!`)) {
            return;
        }

        try {
            const response = await apiClient.deleteUser(userId);
            if (response.success) {
                alert('Foydalanuvchi muvaffaqiyatli o\'chirildi!');
                await loadUsers();
                await loadStats();
            } else {
                alert('Xatolik: ' + (response.error || 'Foydalanuvchini o\'chirishda xatolik'));
            }
        } catch (error: any) {
            alert('Xatolik: ' + (error.message || 'Foydalanuvchini o\'chirishda xatolik'));
        }
    };

    const handleSaveUser = async () => {
        if (!userFormData.fullName || !userFormData.phoneNumber || !userFormData.organization) {
            alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
            return;
        }

        if (!editingUser && !userFormData.password) {
            alert("Yangi foydalanuvchi uchun parol kiriting!");
            return;
        }

        try {
            setLoading(true);
            let response;
            
            if (editingUser) {
                // Update existing user
                response = await apiClient.updateUser(editingUser.id, {
                    fullName: userFormData.fullName,
                    phoneNumber: userFormData.phoneNumber,
                    password: userFormData.password || undefined,
                    organization: userFormData.organization,
                    subscriptionStatus: userFormData.subscriptionStatus,
                    isAdmin: userFormData.isAdmin,
                    isActive: userFormData.isActive
                });
            } else {
                // Create new user
                response = await apiClient.createUser({
                    fullName: userFormData.fullName,
                    phoneNumber: userFormData.phoneNumber,
                    password: userFormData.password,
                    organization: userFormData.organization,
                    subscriptionStatus: userFormData.subscriptionStatus,
                    isAdmin: userFormData.isAdmin,
                    isActive: userFormData.isActive
                });
            }

            if (response.success) {
                alert(editingUser ? 'Foydalanuvchi muvaffaqiyatli yangilandi!' : 'Foydalanuvchi muvaffaqiyatli qo\'shildi!');
                setShowUserForm(false);
                await loadUsers();
                await loadStats();
            } else {
                const errorMsg = typeof response.error === 'object' 
                    ? JSON.stringify(response.error) 
                    : response.error || 'Xatolik yuz berdi';
                alert('Xatolik: ' + errorMsg);
            }
        } catch (error: any) {
            alert('Xatolik: ' + (error.message || 'Foydalanuvchini saqlashda xatolik'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = async (userId: string) => {
        try {
            setReceiptLoading(true);
            const response = await apiClient.getUserReceipt(userId);
            if (response.success && response.receipt_url) {
                setReceiptUrl(response.receipt_url);
                setShowReceiptModal(true);
            } else {
                alert('Chek rasmi topilmadi. Foydalanuvchi hali chek yuklamagan yoki chek o\'chirilgan.');
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                alert('Chek rasmi topilmadi. Foydalanuvchi hali chek yuklamagan yoki chek o\'chirilgan.');
            } else {
                alert('Xatolik: ' + (error.message || 'Chek rasmini yuklashda xatolik'));
            }
        } finally {
            setReceiptLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        if (filter === 'PENDING') return u.subscriptionStatus === 'PENDING';
        return true;
    });

    return (
        <div className="min-h-screen p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="glass-panel p-6 rounded-3xl flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="bg-red-500 text-white p-2 rounded-lg text-lg">🛡️</span> 
                        Super Admin Paneli
                    </h1>
                    <p className="text-slate-500">SaaS Boshqaruv Tizimi</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowApiKeySettings(!showApiKeySettings)} 
                        className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
                    >
                        <span>🔑</span> Gemini API Key
                    </button>
                    <button onClick={onLogout} className="px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-black">Chiqish</button>
                </div>
            </div>

            {/* API Key Settings Panel */}
            {showApiKeySettings && (
                <div className="glass-panel p-6 rounded-3xl border-2 border-blue-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <span>🔑</span> Gemini API Key Sozlamalari
                        </h2>
                        <button 
                            onClick={() => setShowApiKeySettings(false)}
                            className="text-slate-500 hover:text-slate-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-slate-600 mb-2">Joriy API Key (yashirilgan):</p>
                            <p className="font-mono text-lg font-bold text-blue-700">{apiKeyMasked || 'Yuklanmoqda...'}</p>
                            {apiKeyUpdated && (
                                <p className="text-xs text-slate-500 mt-2">
                                    Oxirgi yangilanish: {new Date(apiKeyUpdated).toLocaleString('uz-UZ')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Yangi API Key kiriting:
                            </label>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                ⚠️ API key to'g'ri bo'lishi kerak, aks holda AI xizmatlari ishlamaydi.
                            </p>
                        </div>

                        <button
                            onClick={handleUpdateApiKey}
                            disabled={apiKeyLoading || !apiKey.trim()}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                                apiKeyLoading || !apiKey.trim()
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'
                            }`}
                        >
                            {apiKeyLoading ? 'Saqlanmoqda...' : 'API Keyni Yangilash'}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-2xl">⏳</div>
                    <div>
                        <p className="text-slate-500 text-sm">Tasdiq kutayotganlar</p>
                        <p className="text-2xl font-bold">{stats.pendingCount} ta</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl">✅</div>
                    <div>
                        <p className="text-slate-500 text-sm">Faol Obunachilar</p>
                        <p className="text-2xl font-bold">{stats.activeCount} ta</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">💰</div>
                    <div>
                        <p className="text-slate-500 text-sm">Taxminiy Tushum</p>
                        <p className="text-2xl font-bold">{(stats.totalEarnings || 0).toLocaleString('uz-UZ')} so'm</p>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="glass-panel rounded-3xl overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setFilter('PENDING')}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${filter === 'PENDING' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            Tasdiq kutayotganlar {stats.pendingCount > 0 && <span className="ml-2 bg-white text-blue-600 px-2 rounded-full text-xs">{stats.pendingCount}</span>}
                        </button>
                        <button 
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${filter === 'ALL' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            Barcha Foydalanuvchilar
                        </button>
                    </div>
                    <button 
                        onClick={handleCreateUser}
                        className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 font-bold shadow-lg shadow-green-200"
                    >
                        <span>➕</span> Yangi Foydalanuvchi
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-400 text-sm uppercase border-b border-slate-200">
                                <th className="p-4 font-bold">Foydalanuvchi</th>
                                <th className="p-4 font-bold">Tashkilot</th>
                                <th className="p-4 font-bold">Telefon</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-center">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">Yuklanmoqda...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">Ma'lumot topilmadi</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 font-bold">{user.fullName}</td>
                                        <td className="p-4">{user.organization}</td>
                                        <td className="p-4 font-mono text-sm">{user.phoneNumber}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                user.subscriptionStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>
                                                {user.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2 flex-wrap">
                                                {user.subscriptionStatus === 'PENDING' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleViewReceipt(user.id)}
                                                            disabled={receiptLoading}
                                                            className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 shadow-md shadow-purple-200 flex items-center gap-1"
                                                        >
                                                            📄 {receiptLoading ? 'Yuklanmoqda...' : 'Chekni ko\'rish'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 shadow-md shadow-green-200"
                                                        >
                                                            ✅ Tasdiqlash
                                                        </button>
                                                    </>
                                                )}
                                                {user.subscriptionStatus === 'ACTIVE' && (
                                                     <button 
                                                        onClick={() => handleStatusChange(user.id, 'NONE')}
                                                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                                                    >
                                                        Bekor qilish
                                                    </button>
                                                )}
                                                 {user.subscriptionStatus === 'NONE' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                        className="px-3 py-1 border border-green-500 text-green-600 rounded-lg text-sm hover:bg-green-50"
                                                    >
                                                        Faollashtirish
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleEditUser(user)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                                                >
                                                    ✏️ Tahrirlash
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id, user.fullName)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                                >
                                                    🗑️ O'chirish
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Form Modal */}
            {showUserForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="glass-panel p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {editingUser ? '✏️ Foydalanuvchini Tahrirlash' : '➕ Yangi Foydalanuvchi'}
                            </h2>
                            <button 
                                onClick={() => setShowUserForm(false)}
                                className="text-slate-500 hover:text-slate-700 text-3xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Ism Familiya <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={userFormData.fullName}
                                    onChange={(e) => setUserFormData({...userFormData, fullName: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                    placeholder="Ism Familiya"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Telefon Raqami <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+998</span>
                                    <input
                                        type="tel"
                                        value={userFormData.phoneNumber.replace('+998', '')}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/\D/g, '');
                                            if (cleaned.length <= 9) {
                                                setUserFormData({...userFormData, phoneNumber: '+998' + cleaned});
                                            }
                                        }}
                                        className="w-full px-4 pl-16 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                        placeholder="901234567"
                                        maxLength={9}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Parol {!editingUser && <span className="text-red-500">*</span>}
                                    {editingUser && <span className="text-slate-400 text-xs">(O'zgartirish uchun kiriting)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={userFormData.password}
                                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                    placeholder={editingUser ? "O'zgartirish uchun kiriting" : "Parol"}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Tashkilot <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={userFormData.organization}
                                    onChange={(e) => setUserFormData({...userFormData, organization: e.target.value})}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                    placeholder="Tashkilot nomi"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Obuna Holati
                                </label>
                                <select
                                    value={userFormData.subscriptionStatus}
                                    onChange={(e) => setUserFormData({...userFormData, subscriptionStatus: e.target.value as 'NONE' | 'PENDING' | 'ACTIVE'})}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="NONE">NONE</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userFormData.isAdmin}
                                        onChange={(e) => setUserFormData({...userFormData, isAdmin: e.target.checked})}
                                        className="w-5 h-5 rounded border-slate-300"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Admin huquqlari</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userFormData.isActive}
                                        onChange={(e) => setUserFormData({...userFormData, isActive: e.target.checked})}
                                        className="w-5 h-5 rounded border-slate-300"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Faol</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSaveUser}
                                    disabled={loading}
                                    className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                                        loading
                                            ? 'bg-slate-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'
                                    }`}
                                >
                                    {loading ? 'Saqlanmoqda...' : (editingUser ? 'Yangilash' : 'Qo\'shish')}
                                </button>
                                <button
                                    onClick={() => setShowUserForm(false)}
                                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300"
                                >
                                    Bekor qilish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt View Modal */}
            {showReceiptModal && receiptUrl && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReceiptModal(false)}>
                    <div className="glass-panel max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span>📄</span> To'lov Cheki
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowReceiptModal(false);
                                    setReceiptUrl(null);
                                }}
                                className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-slate-50 rounded-xl p-4 mb-4">
                                <img 
                                    src={receiptUrl} 
                                    alt="To'lov cheki" 
                                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="18">Rasm yuklanmadi</text></svg>';
                                    }}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <a 
                                    href={receiptUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold"
                                >
                                    🔗 Yangi oynada ochish
                                </a>
                                <button 
                                    onClick={() => {
                                        setShowReceiptModal(false);
                                        setReceiptUrl(null);
                                    }}
                                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-bold"
                                >
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
