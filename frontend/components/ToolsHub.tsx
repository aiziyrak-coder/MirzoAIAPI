
import React, { useState } from 'react';
import { Tool } from '../types';
import { generateToolResult } from '../services/geminiService';

const TOOLS: Tool[] = [
    { id: 'telegram_post', icon: '📢', title: 'Telegram Post', description: 'Matbuot xizmati uchun rasmiy post tayyorlash.', color: 'bg-blue-100 text-blue-600', promptTemplate: 'Quyidagi mavzuda Telegram kanali uchun rasmiy, emojilarga boy va tushunarli post tayyorla. Hashtaglar qo\'sh.' },
    { id: 'meeting_protocol', icon: '📝', title: 'Majlis Bayoni (Protokol)', description: 'Yig\'ilish qaydlaridan rasmiy protokol yasash.', color: 'bg-slate-100 text-slate-600', promptTemplate: 'Quyidagi qoralama qaydlar asosida rasmiy yig\'ilish bayonnomasi (protokol) tuz. "Eshitildi", "So\'zga chiqdi", "Qaror qilindi" qismlariga ajrat.' },
    { id: 'corruption_check', icon: '🛡️', title: 'Korrupsiya Ekspertizasi', description: 'Hujjat loyihasini korrupsion xatarlarga tekshirish.', color: 'bg-red-100 text-red-600', promptTemplate: 'Quyidagi matnni korrupsiyaga qarshi ekspertizadan o\'tkaz. Qaysi qismlarda noaniqlik, manfaatlar to\'qnashuvi yoki korrupsion xavf borligini aniq ko\'rsatib ber.' },
    { id: 'citizen_appeal', icon: '📩', title: 'Murojaatga Javob', description: 'Fuqaro arizasiga yuridik asoslangan javob xati.', color: 'bg-green-100 text-green-600', promptTemplate: 'Quyidagi fuqaro murojaatiga nisbatan xushmuomala, rasmiy va qonuniy asoslangan javob xati yoz. Javobda muammoni hal etish yo\'llari yoki rad etish sabablarini aniq tushuntir.' },
    { id: 'swot_analysis', icon: '📊', title: 'SWOT Tahlil', description: 'G\'oya yoki loyihaning Kuchli/Zaif tomonlari.', color: 'bg-purple-100 text-purple-600', promptTemplate: 'Quyidagi loyiha yoki g\'oya uchun professional SWOT tahlil (Kuchli tomonlar, Zaif tomonlar, Imkoniyatlar, Tahdidlar) tayyorla va jadval ko\'rinishida taqdim et.' },
    { id: 'speech_writer', icon: '🎤', title: 'Nutq Yozuvchi', description: 'Tadbir uchun ta\'sirli nutq matni.', color: 'bg-orange-100 text-orange-600', promptTemplate: 'Quyidagi tadbir uchun rahbar nomidan tantanali va ta\'sirli nutq matni yoz. Auditoriyani hisobga ol va ilhomlantiruvchi so\'zlardan foydalan.' },
    { id: 'grammar_fix', icon: '✍️', title: 'Tahrirchi (Korrektor)', description: 'Imlo va uslubiy xatolarni tuzatish.', color: 'bg-teal-100 text-teal-600', promptTemplate: 'Quyidagi matndagi barcha imlo, punktuatsiya va uslubiy xatolarni tuzat. Matnning asl mazmunini saqlagan holda uni ravonroq qil.' },
    { id: 'summary', icon: '⚡', title: 'Qisqacha Mazmun (TL;DR)', description: 'Katta matndan eng muhim joylarini ajratish.', color: 'bg-yellow-100 text-yellow-600', promptTemplate: 'Quyidagi katta matnni o\'qib chiq va eng muhim 5 ta asosiy g\'oyani (tezis) ajratib yoz. Qisqa va londa bo\'lsin.' },
    { id: 'vacancy', icon: '💼', title: 'Vakansiya E\'loni', description: 'Ishga qabul qilish uchun talablar matni.', color: 'bg-indigo-100 text-indigo-600', promptTemplate: 'Quyidagi lavozim uchun professional ish e\'loni (vakansiya) matnini tayyorla. Talablar, vazifalar va takliflarni chiroyli formatda yoz.' },
    { id: 'event_script', icon: '🎬', title: 'Tadbir Senariysi', description: 'Bayram yoki uchrashuvning daqiqama-daqiqa rejasi.', color: 'bg-pink-100 text-pink-600', promptTemplate: 'Quyidagi tadbir uchun to\'liq senariy tuz. Boshlovchi so\'zlari, ketma-ketlik va vaqt taqsimotini ko\'rsat.' },
    { id: 'investment_pitch', icon: '💰', title: 'Investitsiya Taqdimoti', description: 'Investorlar uchun loyiha taqdimoti matni.', color: 'bg-emerald-100 text-emerald-600', promptTemplate: 'Xorijiy investorlarni jalb qilish uchun quyidagi loyiha bo\'yicha qisqa va ishonchli "Pitch" (taqdimot matni) tayyorla. Iqtisodiy samaradorlikka urg\'u ber.' },
    { id: 'task_extractor', icon: '✅', title: 'Vazifalar Ajratuvchi', description: 'Matn ichidan topshiriqlarni topib ro\'yxat qilish.', color: 'bg-cyan-100 text-cyan-600', promptTemplate: 'Quyidagi matn yoki transkriptdan barcha aniq topshiriq va vazifalarni ajratib ol. Har bir vazifa uchun mas\'ul ijrochi va muddatni (agar bor bo\'lsa) ko\'rsat.' },
    { id: 'slogan_gen', icon: '💡', title: 'Shior va G\'oyalar', description: 'Kreativ shiorlar va nomlar generatsiyasi.', color: 'bg-lime-100 text-lime-600', promptTemplate: 'Quyidagi mavzu yoki mahsulot uchun 10 ta kreativ, esda qolarli va jarangdor shior (slogan) o\'ylab top.' },
    { id: 'code_gen', icon: '💻', title: 'Excel/Formula Yordamchi', description: 'Excel formulalar yoki oddiy skriptlar yozish.', color: 'bg-gray-100 text-gray-600', promptTemplate: 'Quyidagi hisob-kitobni amalga oshirish uchun Excel formulasi yoki makros yozib ber. Qanday ishlashini tushuntir.' },
    { id: 'translator', icon: '🌍', title: 'Professional Tarjimon', description: 'Hujjatlarni 3 tilga (Uz/Ru/En) sifatli tarjima qilish.', color: 'bg-blue-50 text-blue-500', promptTemplate: 'Quyidagi matnni O\'zbek, Rus va Ingliz tillariga professional darajada tarjima qil. Ma\'no va terminologiyani saqlab qol.' },
    { id: 'mahalla_audit', icon: '🏘️', title: 'Mahalla Auditi', description: 'Mahalladagi muammolar yechimi bo\'yicha taklif.', color: 'bg-amber-100 text-amber-600', promptTemplate: 'Mahalladagi quyidagi muammoni hal qilish uchun "Mahallabay" ishlash tizimi asosida "Yo\'l xaritasi" taklif qil. Ijtimoiy himoya va bandlikni inobatga ol.' },
    { id: 'legal_search', icon: '⚖️', title: 'Huquqiy Asos (Lex.uz)', description: 'Muammo bo\'yicha qonunchilik hujjatlarini topish.', color: 'bg-violet-100 text-violet-600', promptTemplate: 'Ushbu masala bo\'yicha O\'zbekiston Respublikasining qaysi qonunlari, Prezident farmonlari yoki Vazirlar Mahkamasi qarorlari mavjud? Ularning mazmunini qisqacha tushuntir.' },
    { id: 'graph_data', icon: '📈', title: 'Grafik Ma\'lumotlar', description: 'Raqamlarni diagramma uchun tayyorlash.', color: 'bg-rose-100 text-rose-600', promptTemplate: 'Quyidagi matnli ma\'lumotlardan statistik raqamlarni ajratib ol va ularni vizual grafik yaratish uchun JSON formatida taqdim et.' },
    { id: 'email_generator', icon: '📧', title: 'Rasmiy Email', description: 'Professional elektron xat yozish.', color: 'bg-sky-100 text-sky-600', promptTemplate: 'Quyidagi maqsadda rasmiy elektron xat (email) matnini tayyorla. Etiket qoidalariga rioya qil.' },
    { id: 'project_roadmap', icon: '📅', title: 'Loyiha Xaritasi', description: 'Loyiha uchun Roadmap va muddatlar.', color: 'bg-fuchsia-100 text-fuchsia-600', promptTemplate: 'Quyidagi loyihani amalga oshirish uchun bosqichma-bosqich "Yo\'l xaritasi" (Roadmap) tuz.' },
];

export const ToolsHub: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunTool = async () => {
      if (!selectedTool || !input) return;
      setLoading(true);
      try {
          // Pass the Tool ID so the service can use the specific logic
          const res = await generateToolResult(selectedTool.id, selectedTool.promptTemplate, input);
          setResult(res);
      } catch (e) {
          setResult("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-500 text-white p-2 rounded-xl text-2xl">🛠️</span>
                Aqlli Vositalar Markazi
            </h1>
            <p className="text-slate-500">Davlat xizmatchilari uchun 20 ta maxsus sun'iy intellekt yordamchilari.</p>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Tools Grid */}
            <div className={`flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 content-start ${selectedTool ? 'hidden lg:grid lg:w-1/3 lg:flex-none' : ''}`}>
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => {
                            setSelectedTool(tool);
                            setResult('');
                            setInput('');
                        }}
                        className={`p-6 rounded-2xl text-left transition-all border hover:shadow-lg group flex flex-col gap-3 ${
                            selectedTool?.id === tool.id 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' 
                            : 'bg-white border-white/60 hover:border-blue-200 shadow-sm'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${tool.color}`}>
                            {tool.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Workspace */}
            {selectedTool && (
                <div className="flex-1 flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b border-white/50 flex justify-between items-center bg-white/40">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setSelectedTool(null)}
                                className="lg:hidden p-2 hover:bg-white rounded-lg"
                            >
                                ⬅️
                            </button>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${selectedTool.color}`}>
                                {selectedTool.icon}
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800">{selectedTool.title}</h2>
                                <p className="text-xs text-slate-500">AI Generator</p>
                            </div>
                        </div>
                        {result && (
                            <button 
                                onClick={() => navigator.clipboard.writeText(result)}
                                className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
                            >
                                Nusxa olish
                            </button>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Input Area */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col gap-4 border-r border-white/50 overflow-y-auto">
                            <label className="text-sm font-bold text-slate-500 uppercase">Kirish ma'lumotlari:</label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Matnni shu yerga yozing yoki tashlang..."
                                className="flex-1 min-h-[200px] p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700"
                            />
                            <button
                                onClick={handleRunTool}
                                disabled={loading || !input}
                                className={`py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                    loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02]'
                                }`}
                            >
                                {loading ? 'Bajarilmoqda...' : 'Ishga tushirish ✨'}
                            </button>
                        </div>

                        {/* Result Area */}
                        <div className="w-full md:w-1/2 p-6 bg-slate-50/50 flex flex-col gap-4 overflow-hidden">
                             <label className="text-sm font-bold text-slate-500 uppercase flex justify-between">
                                 <span>Natija:</span>
                                 {selectedTool.id === 'speech_writer' && result && (
                                     <button onClick={() => {
                                         // Teleprompter mode trigger (simple alert for now or modal)
                                         const win = window.open('', '_blank');
                                         if(win) {
                                             win.document.write(`
                                                <html><body style="background:black;color:white;font-family:sans-serif;font-size:48px;padding:50px;line-height:1.5;">
                                                ${result.replace(/\n/g, '<br/>')}
                                                <script>window.onload = () => { window.scrollBy(0,1); setInterval(() => window.scrollBy(0, 1), 50); }</script>
                                                </body></html>
                                             `);
                                         }
                                     }} className="text-xs bg-black text-white px-2 py-0.5 rounded">
                                         📺 Teleprompter
                                     </button>
                                 )}
                             </label>
                             <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 overflow-y-auto shadow-inner prose prose-sm max-w-none">
                                 {result ? (
                                     <div className="whitespace-pre-wrap">{result}</div>
                                 ) : (
                                     <div className="h-full flex items-center justify-center text-slate-300 text-center">
                                         <div>
                                             <span className="text-4xl block mb-2">✨</span>
                                             Natija shu yerda paydo bo'ladi
                                         </div>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
