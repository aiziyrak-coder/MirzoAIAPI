
import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { UserGuide } from './UserGuide';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Assalomu alaykum! Men Mirzo AI - raqamli yordamchiman. Platforma bo\'yicha qanday savolingiz bor?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = { role: 'user', text: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
        const response = await sendChatMessage(chatMessages, newMessage.text);
        setChatMessages(prev => [...prev, { 
            role: 'model', 
            text: response.text, 
            timestamp: new Date() 
        }]);
    } catch (e) {
        setChatMessages(prev => [...prev, { 
            role: 'model', 
            text: "Uzr, bog'lanishda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring yoki +998 94 878 88 78 raqamiga qo'ng'iroq qiling.", 
            timestamp: new Date() 
        }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const steps = [
      {
          id: 1,
          title: "Ma'lumotlarni Yuklash",
          desc: "Tizimga PDF, Word, Excel, PowerPoint yoki rasmlarni yuklang. Mirzo AI har qanday formatdagi ma'lumotlarni, jumladan, qo'lyozma va skan qilingan hujjatlarni ham o'qiy oladi.",
          icon: "📂",
          color: "bg-blue-100 text-blue-600"
      },
      {
          id: 2,
          title: "Sun'iy Intellekt Tahlili",
          desc: "Bizning maxsus o'rgatilgan modelimiz hujjat mazmunini 'atomar' darajada tahlil qiladi. U kontekstni tushunadi, raqamlarni tekshiradi va mantiqiy xatolarni aniqlaydi.",
          icon: "🧠",
          color: "bg-purple-100 text-purple-600"
      },
      {
          id: 3,
          title: "Hujjat Generatsiyasi",
          desc: "Tahlil asosida tizim sizga tayyor hisobot, qaror loyihasi, nutq yoki tahliliy ma'lumotnoma yaratib beradi. Hujjat davlat standartlariga to'liq mos keladi.",
          icon: "✍️",
          color: "bg-green-100 text-green-600"
      }
  ];

  const partners = [
    { name: "IT Park", icon: "🏢" },
    { name: "Raqamli Texnologiyalar Markazi", icon: "📡" },
    { name: "Farg'ona shahar hokimligi", icon: "🇺🇿" },
    { name: "Yoshlar Innovatsiya Markazi", icon: "💡" },
    { name: "Farg'ona IIB", icon: "🛡️" },
    { name: "Kichik Biznes Uyishmasi", icon: "🤝" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden font-display bg-[#FAFAFA] text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-400/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-6 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'px-4 md:px-0' : 'px-4'}`}>
        <div className={`mx-auto max-w-5xl transition-all duration-500 rounded-2xl flex items-center justify-between p-3 border ${
            scrolled 
            ? 'bg-white/70 backdrop-blur-xl border-white/40 shadow-lg shadow-black/5 w-full md:w-[600px]' 
            : 'bg-transparent border-transparent w-full'
        }`}>
            <div className="flex items-center gap-3 cursor-pointer pl-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-blue-500/20">M</div>
                <span className={`font-bold tracking-tight text-slate-800 ${scrolled ? 'hidden sm:block' : 'block'}`}>Mirzo AI</span>
            </div>
            <div className={`hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-600 transition-colors">Ishlash Jarayoni</button>
                <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors">Imkoniyatlar</button>
                <button onClick={() => setShowGuide(true)} className="hover:text-blue-600 transition-colors">Qanday Foydalanaman?</button>
                <button onClick={() => scrollToSection('contact')} className="hover:text-blue-600 transition-colors bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">Bog'lanish</button>
            </div>
            <button 
                onClick={onStart}
                className="group relative px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold overflow-hidden shadow-lg shadow-blue-900/10 transition-transform active:scale-95"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="relative flex items-center gap-2">
                    Tizimga Kirish 
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
            </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-40 pb-20 px-4 z-10 min-h-[80vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-blue-100 backdrop-blur-md shadow-sm mb-8 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI 2.0 Versiyasi</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms] leading-[1.1]">
                Davlat Boshqaruvi, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">
                    Raqamli Intellekt.
                </span>
            </h1>
            <p className="max-w-3xl text-lg md:text-xl text-slate-600 mb-10 animate-fade-in-up [animation-delay:200ms] leading-relaxed">
                <strong className="text-slate-900">Mirzo AI</strong> — bu hokimiyat va davlat tashkilotlari faoliyatini avtomatlashtirish, 
                qaror qabul qilish jarayonini tezlashtirish va byurokratiyani qisqartirish uchun yaratilgan 
                birinchi milliy sun'iy intellekt platformasidir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up [animation-delay:300ms]">
                <button 
                    onClick={onStart}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    <span className="text-xl">✨</span> Bepul Boshlash
                </button>
                <button 
                    onClick={() => setShowGuide(true)}
                    className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                    <span>📚</span> Qanday Foydalanaman?
                </button>
                <button 
                     onClick={() => scrollToSection('contact')}
                    className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                    <span>📞</span> Bog'lanish
                </button>
            </div>
        </div>
      </header>

      {/* --- STATISTICS --- */}
      <section className="py-10 border-y border-slate-200/50 bg-white/50 backdrop-blur-sm z-20 relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">10x</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tezroq Ishlash</p>
              </div>
              <div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">99.9%</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aniqlik Darajasi</p>
              </div>
              <div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">24/7</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Doimiy Yordam</p>
              </div>
              <div>
                  <h3 className="text-4xl font-bold text-slate-900 mb-1">100+</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Davlat Tashkilotlari</p>
              </div>
          </div>
      </section>

      {/* --- HOW IT WORKS (INTERACTIVE) --- */}
      <section id="how-it-works" className="py-24 px-4 max-w-7xl mx-auto z-10 relative">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Tizim Qanday Ishlaydi?</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                  Murakkab jarayonlarni uchta oddiy qadamga keltirdik. Sizdan talab qilinadigan yagona narsa — maqsadni belgilash.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left Side: Steps List */}
              <div className="space-y-6">
                  {steps.map((step, index) => (
                      <div 
                        key={step.id}
                        onClick={() => setActiveStep(index)}
                        className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                            activeStep === index 
                            ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/10 scale-105' 
                            : 'bg-white/40 border-transparent hover:bg-white hover:border-slate-200'
                        }`}
                      >
                          <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors ${
                                  activeStep === index ? step.color : 'bg-slate-100 text-slate-400'
                              }`}>
                                  {step.icon}
                              </div>
                              <div>
                                  <h3 className={`text-xl font-bold mb-2 ${activeStep === index ? 'text-slate-900' : 'text-slate-500'}`}>
                                      {index + 1}. {step.title}
                                  </h3>
                                  <p className={`text-sm leading-relaxed ${activeStep === index ? 'text-slate-600' : 'text-slate-400'}`}>
                                      {step.desc}
                                  </p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Right Side: Visual Representation */}
              <div className="relative h-[500px] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl p-8 flex items-center justify-center group">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                   
                   {/* Dynamic Content based on activeStep */}
                   {activeStep === 0 && (
                       <div className="animate-fade-in-up w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                           <div className="flex items-center gap-3 mb-4 text-white">
                               <span className="text-2xl">📤</span>
                               <span className="font-bold">Yuklanmoqda...</span>
                           </div>
                           <div className="space-y-3">
                               <div className="h-2 bg-white/20 rounded-full w-full overflow-hidden">
                                   <div className="h-full bg-blue-500 w-3/4 animate-[shimmer_1s_infinite]"></div>
                               </div>
                               <div className="flex justify-between text-xs text-slate-300">
                                   <span>Hisobot_2024.pdf</span>
                                   <span>75%</span>
                               </div>
                           </div>
                       </div>
                   )}

                   {activeStep === 1 && (
                       <div className="animate-fade-in-up w-full h-full relative">
                           <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-32 h-32 bg-blue-500/30 rounded-full blur-2xl animate-pulse"></div>
                               <span className="text-6xl z-10 animate-bounce">🧠</span>
                           </div>
                           <div className="absolute top-10 right-10 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/50">
                               Kontekst tahlil qilindi
                           </div>
                           <div className="absolute bottom-10 left-10 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/50">
                               Ma'lumotlar tekshirildi
                           </div>
                       </div>
                   )}

                   {activeStep === 2 && (
                       <div className="animate-fade-in-up bg-white text-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                           <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
                           <div className="space-y-2 mb-6">
                               <div className="h-2 w-full bg-slate-100 rounded"></div>
                               <div className="h-2 w-full bg-slate-100 rounded"></div>
                               <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                           </div>
                           <div className="flex gap-2">
                               <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Yuklab olish</button>
                               <button className="px-3 py-2 bg-slate-100 rounded-lg text-xs">🖨️</button>
                           </div>
                       </div>
                   )}
              </div>
          </div>
      </section>

      {/* --- BENEFITS (EXPANDED BENTO) --- */}
      <section id="benefits" className="py-20 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Asosiy Afzalliklar</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Nega aynan Mirzo AI? Chunki u shunchaki vosita emas, balki sizning ishonchli hamkoringizdir.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-blue-900/5 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 text-blue-600">⚡</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Operativlik</h3>
                <p className="text-slate-500 leading-relaxed">
                    Inson omili talab qiladigan 4-5 soatlik tahliliy ishlarni 30 soniyada bajaring. Vaqtingizni ijodiy va strategik vazifalarga sarflang.
                </p>
            </div>
            <div className="md:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-blue-900/5 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl mb-6 text-purple-600">🛡️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Axborot Xavfsizligi</h3>
                <p className="text-slate-500 leading-relaxed">
                    Sizning ma'lumotlaringiz shifrlangan holda saqlanadi. Tizim maxfiy hujjatlar bilan ishlashda xavfsizlik protokollariga to'liq rioya qiladi.
                </p>
            </div>
            <div className="md:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-blue-900/5 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-6 text-green-600">🎯</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Yuqori Aniqlik</h3>
                <p className="text-slate-500 leading-relaxed">
                    Grammatik va stilistik xatolardan holi, rasmiy-idoraviy uslub talablariga 100% javob beradigan mukammal hujjatlar.
                </p>
            </div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES (REFINED) --- */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Cheksiz Imkoniyatlar</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                Hujjatlardan tortib vizual tahlilgacha – barchasi bitta platformada.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Feature 1 - Documents */}
            <div className="md:col-span-2 row-span-1 md:row-span-2 group relative rounded-[2.5rem] bg-white border border-slate-100 p-10 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-3xl mb-6">📝</div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-4">Hujjatlar Konstruktori</h3>
                        <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
                            Buyruq, qaror, bayonnoma, tabrik va rasmiy xatlar. 
                            Faqat mavzuni kiriting, AI siz uchun davlat standartidagi tayyor hujjatni yozib beradi.
                            Hujjatlar avtomatik formatlanadi va chop etishga tayyor holga keltiriladi.
                        </p>
                    </div>
                    {/* Visual representation */}
                    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/60 shadow-xl p-6 mt-8">
                         <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">📄</div>
                            <div className="text-xs font-bold text-slate-700">Hokim Qarori №124</div>
                         </div>
                         <div className="space-y-2">
                             <div className="h-2 bg-slate-100 rounded w-full"></div>
                             <div className="h-2 bg-slate-100 rounded w-full"></div>
                             <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Feature 2 - Analytics */}
            <div className="md:col-span-1 row-span-1 md:row-span-2 group relative rounded-[2.5rem] bg-slate-900 text-white p-10 overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-900 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-30"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-6">📊</div>
                    <h3 className="text-2xl font-bold mb-4">Katta Ma'lumotlar Tahlili</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-8 flex-1">
                        Minglab sahifali Excel, PDF va Word fayllarni soniyalar ichida qayta ishlang. 
                        Yashirin tendensiyalarni aniqlang va strategik bashoratlarni oling.
                    </p>
                    
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between items-end h-24 gap-2">
                             {[40, 70, 50, 90, 60].map((h, i) => (
                                 <div key={i} className="w-full bg-white/20 rounded-t-sm relative group/bar overflow-hidden">
                                     <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-blue-400 rounded-t-sm transition-all duration-1000"></div>
                                 </div>
                             ))}
                        </div>
                        <p className="text-center text-xs text-blue-200 mt-2 font-mono">Samaradorlik O'sishi</p>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* --- PARTNERS SECTION --- */}
      <section className="py-16 bg-slate-50 border-y border-slate-200 z-10 relative">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Bizning Ishonchli Hamkorlar</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                  {partners.map((partner, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 group cursor-default">
                          <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">{partner.icon}</span>
                          <span className="text-sm font-bold text-slate-600 max-w-[150px] leading-tight group-hover:text-slate-900">{partner.name}</span>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- CONTACT SECTION (BOG'LANISH) --- */}
      <section id="contact" className="py-20 px-4 max-w-7xl mx-auto z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Phone / Human Support */}
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                  
                  <div className="relative z-10">
                      <h3 className="text-3xl font-bold mb-4">Jonli Muloqot.</h3>
                      <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                          Platforma bo'yicha savollaringiz bormi? Bizning mutaxassislarimiz bilan to'g'ridan-to'g'ri bog'laning.
                      </p>
                      
                      <div className="space-y-6">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📞</div>
                              <div>
                                  <p className="text-sm text-blue-200 uppercase font-bold">Aloqa Markazi</p>
                                  <p className="text-2xl font-bold font-mono tracking-wider">+998 94 878 88 78</p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📍</div>
                              <div>
                                  <p className="text-sm text-blue-200 uppercase font-bold">Manzil</p>
                                  <p className="text-lg font-medium">Farg'ona shahar</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="relative z-10 mt-10">
                      <a 
                        href="tel:+998948788878"
                        className="inline-flex w-full justify-center items-center gap-3 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg shadow-black/10"
                      >
                          <span>Qo'ng'iroq Qilish</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </a>
                  </div>
              </div>

              {/* AI Chat Support */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 flex flex-col h-[600px] md:h-auto relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                      <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg shadow-purple-500/30">
                          🤖
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">Mirzo AI Chat</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              Online
                          </p>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-200">
                      {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                  msg.role === 'user' 
                                  ? 'bg-blue-600 text-white rounded-br-sm' 
                                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                              }`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isChatLoading && (
                          <div className="flex justify-start">
                              <div className="bg-slate-100 p-4 rounded-2xl rounded-bl-sm flex gap-1">
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                              </div>
                          </div>
                      )}
                      <div ref={chatBottomRef} />
                  </div>

                  <div className="relative">
                      <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                          placeholder="Savolingizni yozing..."
                          className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                      />
                      <button 
                          onClick={handleChatSend}
                          disabled={!chatInput.trim() || isChatLoading}
                          className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                          <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </button>
                  </div>
              </div>
          </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto relative rounded-[3rem] bg-slate-900 overflow-hidden text-center py-24 px-6">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
              <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[100px]"></div>
              
              <div className="relative z-10">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Kelajak Boshqaruviga <br/> Hozir O'ting.</h2>
                  <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                      Mirzo AI bilan ishlash samaradorligini 300% ga oshiring. 
                      Hech qanday murakkab sozlashlarsiz, shunchaki brauzer orqali kiring va ishlating.
                  </p>
                  <button 
                    onClick={onStart}
                    className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                  >
                      Tizimga Kirish
                  </button>
                  <p className="mt-6 text-slate-500 text-sm">30 kunlik bepul sinov muddati mavjud.</p>
              </div>
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">M</div>
                  <span className="font-bold text-slate-900">Mirzo AI Platform</span>
              </div>
              
              <div className="flex gap-8 text-sm font-medium text-slate-500">
                  <a href="#" className="hover:text-slate-900 transition-colors">Xavfsizlik</a>
                  <a href="#" className="hover:text-slate-900 transition-colors">Foydalanish Shartlari</a>
                  <a href="#" className="hover:text-slate-900 transition-colors">Bog'lanish</a>
              </div>

              <div className="text-xs font-bold text-slate-400">
                  © 2026 CDCGroup & CraDev
              </div>
          </div>
      </footer>

      {/* User Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm overflow-y-auto">
          <UserGuide onClose={() => setShowGuide(false)} />
        </div>
      )}
    </div>
  );
};
