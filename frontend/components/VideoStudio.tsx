import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';

export const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleCreateVideo = async () => {
    if (!prompt) return alert("Iltimos, video ssenariysini yozing");
    setLoading(true);
    setVideoUrl(null);
    setStatus("API kaliti tekshirilmoqda...");
    
    try {
      // Access custom aistudio property via casting to avoid type conflicts with global declaration
      const win = window as any;
      if (win.aistudio && !await win.aistudio.hasSelectedApiKey()) {
         await win.aistudio.openSelectKey();
      }

      setStatus("Video generatsiya qilinmoqda (bu bir necha daqiqa vaqt olishi mumkin)...");
      const url = await generateVideo(prompt, aspectRatio);
      setVideoUrl(url);
      setStatus("Tayyor!");
    } catch (error) {
      console.error(error);
      setStatus("Xatolik yuz berdi. Iltimos qayta urinib ko'ring yoki Billing holatini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🎬</span> Veo Video Studio
          </h2>
          <p className="opacity-80">Matnli buyruqlar orqali professional video lavhalar yarating.</p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Video Tavsifi (Prompt)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Masalan: Zamonaviy Toshkent shahri ko'chalari, quyosh botishi, dron tasviri, 4k sifat..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none h-32"
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
             <div className="flex gap-4">
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-4 py-2 rounded-lg border ${aspectRatio === '16:9' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'border-gray-200'}`}
                >
                  Landscape (16:9)
                </button>
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-4 py-2 rounded-lg border ${aspectRatio === '9:16' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'border-gray-200'}`}
                >
                  Portrait (9:16)
                </button>
             </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
             ⚠️ <strong>Eslatma:</strong> Veo modellari pullik hisob (Billing enabled) talab qiladi. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-bold">Batafsil ma'lumot</a>.
          </div>

          <button
            onClick={handleCreateVideo}
            disabled={loading}
            className={`w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-purple-700 transition-all ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Generatsiya jarayoni...' : 'Videoni Yaratish'}
          </button>

          {status && <p className="text-center text-sm text-gray-600 animate-pulse">{status}</p>}

          {videoUrl && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Natija:</h3>
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full rounded-xl shadow-2xl border border-gray-200 bg-black"
              />
              <div className="mt-4 text-center">
                 <a href={videoUrl} download="generated_video.mp4" className="text-purple-600 hover:underline font-medium">Videoni yuklab olish</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};