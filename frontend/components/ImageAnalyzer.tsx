import React, { useState } from 'react';
import { analyzeImage } from '../services/geminiService';
import { UploadedFile } from '../types';

export const ImageAnalyzer: React.FC = () => {
    const [file, setFile] = useState<UploadedFile | null>(null);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFile({ name: f.name, type: f.type, data: reader.result as string });
            };
            reader.readAsDataURL(f);
        }
    }

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const text = await analyzeImage(file, prompt);
            setResult(text);
        } catch (e) {
            alert("Error analyzing image");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold mb-6 text-gov-800">Rasm Tahlili (Vision)</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl h-64 flex items-center justify-center bg-slate-50 relative overflow-hidden">
                            {file ? (
                                <img src={file.data} alt="Preview" className="h-full w-full object-contain" />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <span className="text-4xl block mb-2">📷</span>
                                    Rasmni yuklang
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <textarea 
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Rasmda nima tasvirlangan? Masalan: Ushbu qurilish obyekti holatini baholang."
                            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-gov-500 outline-none"
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className="w-full bg-gov-600 text-white py-3 rounded-lg hover:bg-gov-700 disabled:opacity-50"
                        >
                            {loading ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold mb-2">Tahlil natijasi:</h3>
                        <p className="whitespace-pre-wrap text-slate-700">{result}</p>
                    </div>
                )}
            </div>
        </div>
    );
}