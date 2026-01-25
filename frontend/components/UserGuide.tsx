import React, { useState } from 'react';

interface UserGuideProps {
    onClose?: () => void;
}

export const UserGuide: React.FC<UserGuideProps> = ({ onClose }) => {
    const [activeSection, setActiveSection] = useState<string>('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Boshlash', icon: '🚀' },
        { id: 'registration', title: 'Ro\'yxatdan o\'tish', icon: '📝' },
        { id: 'subscription', title: 'Obuna', icon: '💳' },
        { id: 'document-generation', title: 'Hujjat yaratish', icon: '📄' },
        { id: 'tools', title: 'Asboblar', icon: '🛠️' },
        { id: 'profile', title: 'Profil', icon: '👤' },
        { id: 'faq', title: 'Savol-Javob', icon: '❓' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'getting-started':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>👋</span> Mirzo AI'ga Xush Kelibsiz!
                            </h3>
                            <p className="text-slate-700 leading-relaxed">
                                Mirzo AI - bu sizning raqamli davlat kotibingiz. Platforma yordamida rasmiy hujjatlar, 
                                hisobotlar, nutqlar va boshqa ko'plab hujjatlarni tez va sifatli yaratishingiz mumkin.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">🎯</div>
                                <h4 className="font-bold text-slate-800 mb-2">Asosiy Maqsad</h4>
                                <p className="text-slate-600 text-sm">
                                    Davlat xizmatchilariga rasmiy hujjatlarni yaratishda yordam berish va 
                                    ish samaradorligini oshirish.
                                </p>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">⚡</div>
                                <h4 className="font-bold text-slate-800 mb-2">Tezlik</h4>
                                <p className="text-slate-600 text-sm">
                                    Bir necha daqiqada tayyor hujjatlar. Qo'lda yozishdan 10 barobar tezroq.
                                </p>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">✨</div>
                                <h4 className="font-bold text-slate-800 mb-2">Sifat</h4>
                                <p className="text-slate-600 text-sm">
                                    Davlat standartlariga mos, grammatik jihatdan to'g'ri hujjatlar.
                                </p>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">🔒</div>
                                <h4 className="font-bold text-slate-800 mb-2">Xavfsizlik</h4>
                                <p className="text-slate-600 text-sm">
                                    Barcha ma'lumotlar xavfsiz saqlanadi va faqat sizga tegishli.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'registration':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>📝</span> Ro'yxatdan O'tish
                            </h3>
                            <p className="text-slate-700 mb-4">
                                Tizimdan foydalanish uchun avval ro'yxatdan o'tishingiz kerak.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 mb-2">Landing Page'dan Boshlash</h4>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Bosh sahifada "Boshlash" yoki "Ro'yxatdan o'tish" tugmasini bosing.
                                        </p>
                                        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 font-mono">
                                            Landing Page → "Ro'yxatdan o'tish" tugmasi
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 mb-2">Ma'lumotlarni To'ldirish</h4>
                                        <p className="text-slate-600 text-sm mb-3">
                                            Quyidagi maydonlarni to'ldiring:
                                        </p>
                                        <ul className="space-y-2 text-sm text-slate-600">
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>
                                                <span><strong>To'liq ism:</strong> Familiya, Ism, Otasining ismi</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>
                                                <span><strong>Telefon raqami:</strong> +998901234567 formatida</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>
                                                <span><strong>Tashkilot:</strong> Ishlayotgan tashkilotingiz nomi</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-green-500">✓</span>
                                                <span><strong>Parol:</strong> Kamida 8 belgi (xavfsiz parol tanlang)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        3
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 mb-2">Tasdiqlash</h4>
                                        <p className="text-slate-600 text-sm mb-3">
                                            "Ro'yxatdan o'tish" tugmasini bosing. Agar barcha ma'lumotlar to'g'ri bo'lsa, 
                                            siz muvaffaqiyatli ro'yxatdan o'tasiz va tizimga kirishingiz mumkin bo'ladi.
                                        </p>
                                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
                                            <strong>⚠️ Eslatma:</strong> Agar telefon raqam allaqachon ro'yxatdan o'tgan bo'lsa, 
                                            "Tizimga kirish" tugmasini bosing va mavjud akkauntingiz bilan kiring.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'subscription':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>💳</span> Premium Obuna
                            </h3>
                            <p className="text-slate-700 mb-4">
                                To'liq funksiyalardan foydalanish uchun Premium obunani faollashtirishingiz kerak.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <span>📋</span> Obuna Qadamlari
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-500 font-bold">1.</span>
                                        <div>
                                            <p className="text-slate-700 font-medium">Profil yoki Sidebar'dan "Obuna" bo'limiga o'ting</p>
                                            <p className="text-slate-500 text-sm mt-1">Yoki bosh sahifada "Obunani faollashtirish" tugmasini bosing</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-500 font-bold">2.</span>
                                        <div>
                                            <p className="text-slate-700 font-medium">To'lov chekini yuklang</p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Bank yoki to'lov tizimi orqali to'lov qilganingizdan keyin, 
                                                to'lov chekini (screenshot yoki foto) yuklang. 
                                                Chek aniq va o'qilishi mumkin bo'lishi kerak.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-500 font-bold">3.</span>
                                        <div>
                                            <p className="text-slate-700 font-medium">Tasdiqlashni kutish</p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Administratorlar to'lov chekingizni tekshirib, tasdiqlaydi. 
                                                Bu odatda bir necha soat ichida amalga oshiriladi.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-500 font-bold">4.</span>
                                        <div>
                                            <p className="text-slate-700 font-medium">Obuna faollashadi</p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Tasdiqlangandan keyin sizga xabar yuboriladi va Premium funksiyalar 
                                                darhol ishga tushadi.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl bg-yellow-50 border-2 border-yellow-200">
                                <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                    <span>⏳</span> Tasdiq Kutayotganda
                                </h4>
                                <p className="text-yellow-700 text-sm mb-3">
                                    Agar to'lov chekingiz hali tasdiqlanmagan bo'lsa, "Tasdiq kutayotganlar" sahifasida 
                                    ma'lumot ko'rinadi. Bu yerda:
                                </p>
                                <ul className="space-y-1 text-sm text-yellow-700">
                                    <li>• To'lov holati ko'rinadi</li>
                                    <li>• Administrator bilan bog'lanish uchun telefon raqami mavjud</li>
                                    <li>• Qo'ng'iroq yoki WhatsApp orqali tezkor javob olish mumkin</li>
                                </ul>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-3">💡 Maslahatlar</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>To'lov cheki yorug' va aniq bo'lishi kerak</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Chekda to'lov summasi va sana ko'rinishi kerak</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span>Agar chek rad etilsa, yangi aniq chek yuklang</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'document-generation':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>📄</span> Hujjat Yaratish
                            </h3>
                            <p className="text-slate-700 mb-4">
                                Mirzo AI yordamida turli xil rasmiy hujjatlarni yaratishingiz mumkin.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-4">📝 Qadam-baqadam Ko'rsatma</h4>
                                
                                <div className="space-y-4">
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h5 className="font-bold text-slate-700 mb-2">1. Hujjat turini tanlang</h5>
                                        <p className="text-slate-600 text-sm mb-2">
                                            "Hujjat Generator" bo'limiga o'ting va quyidagi hujjat turlaridan birini tanlang:
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                            {['Hisobot', 'Axborotnoma', 'Ma\'ruza', 'Nutq', 'Tabrik', 'Buyruq', 'Ariza', 'Strategiya', 'Matbuot'].map((type) => (
                                                <div key={type} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-center">
                                                    {type}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-l-4 border-green-500 pl-4">
                                        <h5 className="font-bold text-slate-700 mb-2">2. Ma'lumotlarni kiriting</h5>
                                        <p className="text-slate-600 text-sm mb-2">
                                            Quyidagi maydonlarni to'ldiring:
                                        </p>
                                        <ul className="space-y-1 text-sm text-slate-600 ml-4">
                                            <li>• <strong>Mavzu:</strong> Hujjatning asosiy mavzusi</li>
                                            <li>• <strong>Ko'rsatma:</strong> Qanday hujjat kerakligini batafsil yozing</li>
                                            <li>• <strong>Fayllar (ixtiyoriy):</strong> Qo'shimcha ma'lumotlar uchun fayl yuklang</li>
                                        </ul>
                                    </div>

                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h5 className="font-bold text-slate-700 mb-2">3. Hujjat yaratish</h5>
                                        <p className="text-slate-600 text-sm mb-2">
                                            "Hujjat Yaratish" tugmasini bosing. AI bir necha soniya ichida hujjatni yaratadi.
                                        </p>
                                        <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700 mt-2">
                                            <strong>💡 Maslahat:</strong> Ko'rsatmani batafsilroq yozsangiz, hujjat sifatliroq bo'ladi.
                                        </div>
                                    </div>

                                    <div className="border-l-4 border-orange-500 pl-4">
                                        <h5 className="font-bold text-slate-700 mb-2">4. Tahrirlash va saqlash</h5>
                                        <p className="text-slate-600 text-sm mb-2">
                                            Yaratilgan hujjatni ko'rib chiqing, kerak bo'lsa tahrirlang va saqlang.
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs">
                                                📥 Yuklab olish
                                            </button>
                                            <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs">
                                                💾 Saqlash
                                            </button>
                                            <button className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs">
                                                ✏️ Tahrirlash
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-3">📎 Fayl Yuklash</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Hujjat yaratishda qo'shimcha ma'lumotlar uchun quyidagi formatlardagi fayllarni yuklashingiz mumkin:
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['PDF', 'Word', 'Excel', 'PowerPoint', 'Rasm', 'TXT'].map((format) => (
                                        <div key={format} className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-center text-sm font-medium">
                                            {format}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-500 text-xs mt-3">
                                    <strong>Eslatma:</strong> Bir nechta fayl yuklashingiz mumkin. AI ularni tahlil qilib, 
                                    hujjat yaratishda foydalanadi.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'tools':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>🛠️</span> Asboblar va Funksiyalar
                            </h3>
                            <p className="text-slate-700 mb-4">
                                Mirzo AI'da sizga yordam beradigan turli xil asboblar mavjud.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">💬</div>
                                <h4 className="font-bold text-slate-800 mb-2">Chat Yordamchi</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Har qanday savolingizga javob beradi, maslahatlar beradi va yordam ko'rsatadi.
                                </p>
                                <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
                                    <strong>Qayerda:</strong> Dashboard → Chat Yordamchi
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">🗺️</div>
                                <h4 className="font-bold text-slate-800 mb-2">Xarita Tahlili</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Google Maps ma'lumotlarini tahlil qiladi va joylashuv bo'yicha ma'lumotlar beradi.
                                </p>
                                <div className="bg-green-50 p-2 rounded text-xs text-green-700">
                                    <strong>Qayerda:</strong> Dashboard → Xarita Tahlili
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">🖼️</div>
                                <h4 className="font-bold text-slate-800 mb-2">Rasm Tahlili</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Yuklangan rasmlarni tahlil qiladi, matnni o'qiydi va tushuntirish beradi.
                                </p>
                                <div className="bg-purple-50 p-2 rounded text-xs text-purple-700">
                                    <strong>Qayerda:</strong> Dashboard → Rasm Tahlili
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">🎥</div>
                                <h4 className="font-bold text-slate-800 mb-2">Video Studio</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Video kontent yaratish, tahrirlash va optimallashtirish bo'yicha yordam beradi.
                                </p>
                                <div className="bg-red-50 p-2 rounded text-xs text-red-700">
                                    <strong>Qayerda:</strong> Dashboard → Video Studio
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">💻</div>
                                <h4 className="font-bold text-slate-800 mb-2">Excel/Formula Yordamchi</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Excel formulalar, makrolar va hisob-kitoblar bo'yicha yordam beradi.
                                </p>
                                <div className="bg-gray-50 p-2 rounded text-xs text-gray-700">
                                    <strong>Qayerda:</strong> Dashboard → Excel Yordamchi
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <div className="text-4xl mb-3">📚</div>
                                <h4 className="font-bold text-slate-800 mb-2">Saqlangan Hujjatlar</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Yaratilgan barcha hujjatlarni ko'rib chiqing, tahrirlang yoki qayta foydalaning.
                                </p>
                                <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-700">
                                    <strong>Qayerda:</strong> Dashboard → Saqlanganlar
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>👤</span> Profil Boshqaruvi
                            </h3>
                            <p className="text-slate-700 mb-4">
                                Profilingizni boshqarish va obuna holatingizni kuzatish.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-3">📊 Profil Ma'lumotlari</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Profil sahifasida quyidagi ma'lumotlarni ko'rishingiz mumkin:
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>To'liq ism:</strong> Ro'yxatdan o'tgan ismingiz</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>Tashkilot:</strong> Ishlayotgan tashkilotingiz</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>Telefon raqami:</strong> Ro'yxatdan o'tgan raqam</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>Obuna holati:</strong> Faol, Kutilmoqda yoki Obunasiz</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>Obuna muddati:</strong> Qancha kun qolgani</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-3">🔔 Obuna Xabarnomalari</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        <span>
                                            <strong>Obuna tugashida:</strong> Obuna muddati tugashidan 3 kun oldin 
                                            sizga xabar yuboriladi va profil sahifasida ogohlantirish ko'rinadi.
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-yellow-500">⚠</span>
                                        <span>
                                            <strong>Tasdiq kutayotganda:</strong> To'lov cheki yuborilgandan keyin 
                                            holat "KUTILMOQDA" ko'rinadi.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-3">📚 Saqlangan Hujjatlar</h4>
                                <p className="text-slate-600 text-sm mb-3">
                                    Profil sahifasida yaratilgan barcha hujjatlarni ko'rishingiz mumkin:
                                </p>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    <li>• Hujjat nomi va turi</li>
                                    <li>• Yaratilgan sana</li>
                                    <li>• Hujjatni ko'rish, tahrirlash yoki o'chirish</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            case 'faq':
                return (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border-2 border-rose-200">
                            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span>❓</span> Tez-tez So'raladigan Savollar
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-2">Q: Parolni unutdim, qanday tiklash mumkin?</h4>
                                <p className="text-slate-600 text-sm">
                                    A: Hozircha parolni tiklash funksiyasi mavjud emas. Iltimos, administrator bilan 
                                    bog'laning: <strong>+998 94 878 88 78</strong>
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-2">Q: To'lov cheki qancha vaqtda tasdiqlanadi?</h4>
                                <p className="text-slate-600 text-sm">
                                    A: Odatda bir necha soat ichida, lekin ba'zida 24 soatgacha vaqt ketishi mumkin. 
                                    Tezkor javob uchun administrator bilan bog'laning.
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-2">Q: Obuna muddati qancha?</h4>
                                <p className="text-slate-600 text-sm">
                                    A: Premium obuna 30 kun davomida amal qiladi. Muddati tugagach, qayta to'lov qilishingiz kerak.
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-2">Q: Qanday hujjat turlarini yaratish mumkin?</h4>
                                <p className="text-slate-600 text-sm">
                                    A: Hisobot, Axborotnoma, Ma'ruza, Nutq, Tabrik, Buyruq/Qaror, Ariza, Strategiya, 
                                    Matbuot xabari va boshqalar. Barcha hujjatlar davlat standartlariga mos keladi.
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-2">Q: Fayl yuklashda qanday formatlar qo'llab-quvvatlanadi?</h4>
                                <p className="text-slate-600 text-sm">
                                    A: PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Rasm (.jpg, .png) va 
                                    matn fayllari (.txt). Bir nechta fayl yuklashingiz mumkin.
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl">
                                <h4 className="font-bold text-slate-800 mb-2">Q: Ma'lumotlarim xavfsizmi?</h4>
                                <p className="text-slate-600 text-sm">
                                    A: Ha, barcha ma'lumotlar xavfsiz saqlanadi va faqat sizga tegishli. 
                                    Hech kim sizning ma'lumotlaringizga kirish olmaydi.
                                </p>
                            </div>

                            <div className="glass-panel p-6 rounded-2xl bg-blue-50 border-2 border-blue-200">
                                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                    <span>📞</span> Qo'shimcha Yordam
                                </h4>
                                <p className="text-blue-700 text-sm mb-2">
                                    Agar savolingizga javob topilmagan bo'lsa, quyidagi usullar bilan bog'laning:
                                </p>
                                <div className="space-y-2 text-sm text-blue-700">
                                    <div className="flex items-center gap-2">
                                        <span>📞</span>
                                        <span><strong>Telefon:</strong> +998 94 878 88 78</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>💬</span>
                                        <span><strong>WhatsApp:</strong> +998 94 878 88 78</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="glass-panel p-6 rounded-3xl mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <span>📚</span> Foydalanish Qo'llanmasi
                        </h1>
                        <p className="text-slate-500 mt-1">Mirzo AI platformasidan to'liq foydalanish bo'yicha batafsil ko'rsatma</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-bold transition-all"
                        >
                            ✕ Yopish
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="md:col-span-1">
                        <div className="glass-panel p-4 rounded-2xl sticky top-6">
                            <h3 className="font-bold text-slate-800 mb-4">Bo'limlar</h3>
                            <div className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                                            activeSection === section.id
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        <span className="mr-2">{section.icon}</span>
                                        {section.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3">
                        <div className="glass-panel p-6 md:p-8 rounded-3xl min-h-[600px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
