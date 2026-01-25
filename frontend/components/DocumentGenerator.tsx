

import React, { useState, useRef, useEffect } from 'react';
import { DocumentType, GroundingSource, Sector } from '../types';
import { generateDocument, refineDocument } from '../services/geminiService';

export const DocumentGenerator: React.FC = () => {
  const [organization, setOrganization] = useState('Farg\'ona shahar hokimligi');
  const [sector, setSector] = useState<Sector>(Sector.HOKIMYAT);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.HISOBOT);
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Dynamic Placeholder
  const [placeholder, setPlaceholder] = useState('');

  // Refinement State
  const [refining, setRefining] = useState(false);
  const [result, setResult] = useState<string>('');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refineFiles, setRefineFiles] = useState<File[]>([]); 

  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [useSearch, setUseSearch] = useState(true);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Updated suggestions based on user request for "Hokimiyat" context
  const refinementSuggestions = [
      "Ilmiy terminologiya va Diplomatik tilga o'tkazish",
      "Yanada batafsilroq va kengroq yozish",
      "Statistik jadvallar va raqamlar qo'shish",
      "Ijro mexanizmi va KPI qo'shish",
      "Qisqartirish va londa qilish (Tezis)"
  ];

  useEffect(() => {
      switch(docType) {
          case DocumentType.HISOBOT:
              setPlaceholder("Masalan: 2024-yil 1-chorak yakunlari bo'yicha investitsiya dasturi ijrosi haqida. Kamchiliklar va sabablarini ko'rsatish.");
              break;
          case DocumentType.NUTQ:
          case DocumentType.MAORUZA:
              setPlaceholder("Masalan: 'Yoshlar kuni' tadbirida so'zlanadigan nutq. Auditoriya: Talabalar va faollar. Asosiy g'oya: Yangi imkoniyatlar.");
              break;
          case DocumentType.TABRIK:
              setPlaceholder("Masalan: 8-mart bayrami munosabati bilan ayol xodimlarni tabriklash. Samimiy va iliq so'zlar bo'lsin.");
              break;
          case DocumentType.AHBOROTNOMA:
              setPlaceholder("Masalan: O'tgan haftada tumanda amalga oshirilgan obodonlashtirish ishlari haqida qisqa dayjest.");
              break;
          default:
              setPlaceholder("Hujjatning asosiy maqsadi, kimga mo'ljallanganligi va muhim nuqtalar...");
      }
  }, [docType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = [];
      Array.from(e.target.files).forEach((file: File) => {
        const isDoc = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isPpt = file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage && !isDoc && !isPpt) {
          alert(`"${file.name}" fayli qabul qilinmadi. Faqat PDF, Word (.docx), PowerPoint (.pptx) yoki Rasm yuklang.`);
          return;
        }

        newFiles.push(file);
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRefineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = [];
      Array.from(e.target.files).forEach((file: File) => {
        const isDoc = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isPpt = file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage && !isDoc && !isPpt) {
          alert(`"${file.name}" fayli qabul qilinmadi. Faqat PDF, Word (.docx), PowerPoint (.pptx) yoki Rasm yuklang.`);
          return;
        }

        newFiles.push(file);
      });
      setRefineFiles(prev => [...prev, ...newFiles]);
    }
  };

  const toggleRecording = () => {
      if (!('webkitSpeechRecognition' in window)) {
          alert("Sizning brauzeringizda ovozli yozish ishlamaydi (Chrome ishlating).");
          return;
      }

      if (isRecording) {
          setIsRecording(false);
          return;
      }

      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'uz-UZ';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setGoal(prev => prev + " " + transcript);
      };

      recognition.start();
  };

  const handleSpeak = () => {
      if (!result) return;
      const cleanText = result.replace(/<[^>]+>/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Try to find a Russian voice if Uzbek is not available, as it approximates better than English
      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find(v => v.lang.includes('ru'));
      if(ruVoice) utterance.voice = ruVoice;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
  };

  const handleGenerate = async () => {
    if (!topic) return alert("Mavzuni kiriting");
    setLoading(true);
    setResult('');
    setSources([]);
    try {
      const response = await generateDocument(docType, sector, topic, goal, files, useSearch, organization);
      setResult(response.text);
      if (response.sources) setSources(response.sources);
      // History is now automatically saved on backend
    } catch (error: any) {
      alert("Xatolik: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
      if (!result || (!refineInstruction && refineFiles.length === 0)) return;
      setRefining(true);
      try {
          const newText = await refineDocument(result, refineInstruction, refineFiles);
          setResult(newText);
          setRefineInstruction('');
          setRefineFiles([]);
      } catch (e: any) {
          alert("Xatolik: " + (e.message || e));
      } finally {
          setRefining(false);
      }
  };

  const handlePrintPDF = () => {
    if (!result) return alert("Chop etish uchun hujjat mavjud emas.");

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Iltimos, brauzerda pop-up oynalarga ruxsat bering.");
        return;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${docType} - ${topic}</title>
            <style>
                @page { margin: 2.5cm; size: A4; }
                body { 
                    font-family: "Times New Roman", Times, serif; 
                    line-height: 1.5; 
                    color: #000;
                    margin: 0;
                    padding: 20px;
                }
                h1, h2, h3, h4 { 
                    color: #000; 
                    margin-top: 1.5em; 
                    margin-bottom: 0.8em; 
                    font-weight: bold;
                }
                h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; font-size: 16pt; }
                p { margin-bottom: 1em; text-align: justify; font-size: 12pt; }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0; 
                    page-break-inside: avoid;
                }
                th, td { 
                    border: 1px solid #000; 
                    padding: 8px; 
                    text-align: left; 
                    font-size: 11pt;
                }
                th { background-color: #f0f0f0; }
                
                /* AI Generated Highlight Colors Preservation */
                .highlight-red { color: #dc2626 !important; }
                
                .footer-sources {
                    margin-top: 50px;
                    border-top: 1px solid #eee;
                    padding-top: 10px;
                    font-size: 10pt;
                    color: #555;
                }
                a { color: #2563eb; text-decoration: none; }
            </style>
        </head>
        <body>
            ${result}
            
            ${sources.length > 0 ? `
                <div class="footer-sources">
                    <strong>Foydalanilgan manbalar:</strong><br/>
                    ${sources.map(s => `<div>• <a href="${s.uri}">${s.title}</a></div>`).join('')}
                </div>
            ` : ''}

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 overflow-hidden">
      {/* Configuration Panel */}
      <div className="glass-panel w-full lg:w-1/3 rounded-3xl p-6 flex flex-col overflow-y-auto no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">📝</span> Parametrlar
        </h2>

        <div className="space-y-5 flex-1">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tashkilot Nomi</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Masalan: Farg'ona shahar hokimligi"
                className="w-full p-4 bg-white/50 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none backdrop-blur-sm font-bold text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faoliyat Sohasi</label>
              <select 
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full p-4 bg-white/50 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none backdrop-blur-sm transition-all text-slate-800 font-medium"
              >
                {Object.values(Sector).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hujjat turi</label>
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full p-4 bg-white/50 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none backdrop-blur-sm transition-all"
              >
                {Object.values(DocumentType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mavzu</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Hujjat nima haqida?"
                className="w-full p-4 bg-white/50 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maqsad va Tafsilotlar</label>
              <div className="relative">
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-4 bg-white/50 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none backdrop-blur-sm h-32 resize-none"
                  />
                  <button 
                    onClick={toggleRecording}
                    className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-500 hover:text-blue-500 shadow-sm'}`}
                    title="Ovozli yozish (Mikrofon)"
                  >
                     {isRecording ? '🛑' : '🎤'}
                  </button>
              </div>
            </div>
            
            <label className="flex items-center gap-3 p-4 bg-white/40 rounded-2xl cursor-pointer hover:bg-white/60 transition-colors border border-white/50">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        checked={useSearch} 
                        onChange={e => setUseSearch(e.target.checked)} 
                        className="peer h-5 w-5 opacity-0 absolute"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                        <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <span className="text-sm font-medium text-slate-700">Internetdan ma'lumot izlash (Statistika va Faktlar)</span>
            </label>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Materiallar</span>
                  <span className="text-red-500 font-bold bg-red-100 px-2 py-0.5 rounded text-[10px] animate-pulse">
                     PDF, Word, PPTX yoki Rasm
                  </span>
              </label>
              <div className="border-2 border-dashed border-blue-300/50 bg-blue-50/30 rounded-2xl p-6 text-center hover:bg-white/60 hover:border-blue-400 transition-all cursor-pointer relative group">
                <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                />
                <div className="pointer-events-none group-hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl block mb-2 drop-shadow-sm">📂</span>
                    <span className="text-sm font-bold text-slate-600">Fayllarni tanlang</span>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        .pdf, .docx, .pptx, .jpg, .png formatlar
                    </p>
                </div>
              </div>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.map((f, i) => (
                    <span key={i} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-sm ${
                        f.type.includes('pdf')
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : f.type.includes('word') || f.type.includes('document')
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : f.type.includes('presentation') || f.type.includes('powerpoint')
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {f.type.includes('pdf') ? '📄' : 
                       f.type.includes('word') || f.type.includes('document') ? '📝' :
                       f.type.includes('presentation') || f.type.includes('powerpoint') ? '📊' : '🖼️'} 
                      {f.name.substring(0, 20)}{f.name.length > 20 ? '...' : ''}
                      <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="w-5 h-5 flex items-center justify-center bg-white/50 rounded-full hover:bg-white hover:text-red-600 transition-colors">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
        </div>

        <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110'
            }`}
        >
            {loading ? (
                <><span className="animate-spin text-xl">⚪</span> Kengaytirilgan Tahlilni Boshlash...</>
            ) : (
                <>✨ Mukammal Hujjat Yaratish</>
            )}
        </button>
      </div>

      {/* Preview Panel */}
      <div className="glass-panel w-full lg:w-2/3 rounded-3xl flex flex-col overflow-hidden relative">
        {result ? (
            <>
                <div className="p-4 border-b border-white/50 flex justify-between items-center bg-white/20 backdrop-blur-md z-10 no-print">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium text-slate-600">Natija (Boyitilgan HTML)</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSpeak}
                            className="px-3 py-2 bg-white/50 text-slate-700 rounded-xl text-sm font-medium hover:bg-white hover:text-blue-600 transition-colors border border-white/50 flex items-center gap-2"
                            title="O'qib berish (TTS)"
                        >
                            🔊
                        </button>
                        <button 
                            onClick={handlePrintPDF}
                            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors shadow-lg shadow-slate-500/20 flex items-center gap-2"
                        >
                            🖨️ <span className="hidden sm:inline">PDF Saqlash</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-white" ref={printRef}>
                    <div 
                        id="document-preview"
                        className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-justify prose-p:leading-relaxed"
                        contentEditable={true} 
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: result }}
                        style={{
                            fontFamily: '"Times New Roman", Times, serif', 
                        }}
                    />
                    
                     {sources.length > 0 && (
                         <div className="mt-8 pt-6 border-t border-slate-300/50 no-print">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3">Manbalar va Asoslar</p>
                            <div className="flex flex-wrap gap-2">
                               {sources.map((src, idx) => (
                                  <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs text-blue-600 hover:bg-white transition-colors">
                                     🔗 {src.title}
                                  </a>
                               ))}
                            </div>
                         </div>
                    )}
                </div>

                <div className="p-4 bg-white/60 backdrop-blur-md border-t border-white/50 no-print flex flex-col gap-3">
                    <p className="text-xs font-bold text-slate-500 uppercase">Tezkor Tahrirlash:</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {refinementSuggestions.map((suggestion, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setRefineInstruction(suggestion)}
                                className="px-3 py-1.5 bg-white/80 border border-white/60 rounded-lg text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all whitespace-nowrap shadow-sm"
                            >
                                ✨ {suggestion}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        {refineFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {refineFiles.map((f, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1">
                                        📎 {f.name.substring(0, 15)}...
                                        <button onClick={() => setRefineFiles(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-3 items-center">
                            <label className="p-3 bg-white/50 border border-white/60 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors text-slate-500 hover:text-blue-500" title="Qo'shimcha fayl ilova qilish">
                                <input 
                                    type="file" 
                                    multiple 
                                    hidden 
                                    onChange={handleRefineFileChange}
                                    accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                />
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </label>
                            
                            <input 
                                type="text" 
                                value={refineInstruction}
                                onChange={(e) => setRefineInstruction(e.target.value)}
                                placeholder="Buyruq bering yoki yuqoridan tanlang..."
                                className="flex-1 p-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-sm backdrop-blur-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                            />
                            <button 
                                onClick={handleRefine}
                                disabled={refining || (!refineInstruction && refineFiles.length === 0)}
                                className="px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/20 hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {refining ? (
                                    <span className="animate-spin">⚪</span>
                                ) : (
                                    <>
                                       <span>Yangilash</span>
                                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-100/50 flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-xl font-medium text-slate-600 mb-2">Mukammal Hujjat Tizimi</h3>
                <p className="max-w-md mx-auto text-sm opacity-70">
                    Sohani va Hujjat Turini tanlang. AI siz uchun:
                    <br/><br/>
                    <span className="text-blue-500">• Hisobotlarni chuqur tahlil qiladi</span><br/>
                    <span className="text-purple-500">• Ta'sirli nutq va ma'ruzalar yozadi</span><br/>
                    <span className="text-green-500">• Tabriklarni samimiy qiladi</span>
                </p>
            </div>
        )}
      </div>
    </div>
  );
};