import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

export const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Assalomu alaykum! Men Mirzo - sizning raqamli davlat kotibingizman. Har qanday rasmiy hujjat, tahlil yoki huquqiy masalada yordam bera olaman.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(messages, input);
      setMessages(prev => [...prev, { 
          role: 'model', 
          text: response.text, 
          timestamp: new Date(),
          sources: response.sources 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Kechirasiz, xatolik yuz berdi.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full p-4 lg:p-6 flex flex-col max-w-5xl mx-auto">
      <div className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden relative shadow-2xl shadow-blue-900/5">
        
        {/* Header */}
        <div className="p-4 border-b border-white/50 bg-white/30 backdrop-blur-md z-10 flex items-center gap-3">
           <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
           <span className="font-bold text-slate-700">Mirzo Chat</span>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] lg:max-w-[70%] p-4 lg:p-5 rounded-3xl shadow-sm text-sm lg:text-base leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-blue-500/30' 
                  : 'bg-white/80 backdrop-blur-md text-slate-800 rounded-bl-none border border-white/60'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sources && (
                    <div className="mt-3 pt-2 border-t border-white/20 text-xs opacity-80">
                        <strong className="block mb-1">Manbalar:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                            {msg.sources.map((s, i) => <li key={i}>{s.title}</li>)}
                        </ul>
                    </div>
                )}
                <span className={`text-[10px] block mt-2 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-white/80 p-4 rounded-3xl rounded-bl-none border border-white/60 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-6 bg-white/40 border-t border-white/50 backdrop-blur-md">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
              placeholder="Savolingizni yozing..."
              className="flex-1 p-4 bg-white/70 border border-white/60 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none resize-none h-14 max-h-32 shadow-inner text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-14 w-14 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transform active:scale-95"
            >
              <svg className="w-6 h-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};