import React, { useState, useEffect } from 'react';
import { askMaps } from '../services/geminiService';

export const MapsAnalysis: React.FC = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => console.log("Location permission denied, defaulting to Tashkent"),
            );
        }
    }, []);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        // Default to Tashkent if no location
        const lat = location?.lat || 41.2995;
        const lng = location?.lng || 69.2401;
        
        try {
            const res = await askMaps(query, lat, lng);
            setResponse(res.text);
        } catch (e) {
            setResponse("Xatolik yuz berdi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gov-800">
                    <span>🗺️</span> Hududiy Tahlil (Maps Grounding)
                </h2>
                <p className="text-slate-600 mb-6">
                    Hududingizdagi joylar, masofalar va infratuzilma haqida aniq ma'lumot oling.
                </p>
                
                <div className="flex gap-2 mb-6">
                    <input 
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Masalan: Yaqin atrofda qanday maktablar bor?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Izlanmoqda...' : 'Qidirish'}
                    </button>
                </div>

                {response && (
                    <div className="bg-slate-50 p-6 rounded-xl prose prose-slate max-w-none">
                         <div className="whitespace-pre-wrap">{response}</div>
                    </div>
                )}
            </div>
        </div>
    )
}