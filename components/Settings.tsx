import React, { useState, useEffect } from 'react';
import { Language, GeminiModelId } from '../types';
import { translations } from '../services/translations';
import { storageService } from '../services/storageService';
import { ShieldCheck, Info } from 'lucide-react'; // Tambah icon ini

interface SettingsProps {
  language: Language;
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ language, onResetData }) => {
  const t = translations[language];
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [groqKey, setGroqKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<GeminiModelId>('gemini-1.5-flash');

  useEffect(() => {
    setGeminiKey(storageService.getGeminiKey() || '');
    setGroqKey(storageService.getGroqKey() || '');
    setGeminiModel((localStorage.getItem('health_creator_gemini_model') as GeminiModelId) || 'gemini-1.5-flash');
  }, []);

  const handleSaveGemini = () => {
    storageService.saveGeminiKey(geminiKey);
    localStorage.setItem('health_creator_gemini_model', geminiModel);
    alert(language === 'id' ? 'Konfigurasi Gemini tersimpan di browser Anda!' : 'Gemini configuration saved locally!');
  };

  const handleSaveGroq = () => {
    storageService.saveGroqKey(groqKey);
    alert(language === 'id' ? 'API Key Groq tersimpan di browser Anda!' : 'Groq API Key saved locally!');
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 pb-32">
      
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{t.settings_title}</h2>
        <p className="text-slate-500 font-medium mt-2">{t.settings_subtitle}</p>
      </div>

      {/* PRIVACY NOTICE (PENTING BUAT MEMBER) */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4 mb-10">
         <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
           <ShieldCheck size={24} />
         </div>
         <div>
           <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide mb-1">
             {language === 'id' ? 'Data & API Key Anda Aman' : 'Your Data & Keys are Safe'}
           </h4>
           <p className="text-xs text-emerald-700/80 leading-relaxed">
             {language === 'id' 
               ? 'Aplikasi ini berjalan 100% di browser Anda (Client-Side). API Key disimpan di Local Storage perangkat Anda dan tidak pernah dikirim ke server kami. Privasi Anda terjaga.'
               : 'This app runs 100% in your browser (Client-Side). API Keys are stored in your device\'s Local Storage and are never sent to our servers. Your privacy is guaranteed.'}
           </p>
         </div>
      </div>

      <div className="space-y-8">
        {/* Gemini Section */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-8 group hover:border-emerald-200 transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">✨</div>
                <div>
                  <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase">Google Gemini</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${geminiKey ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {geminiKey ? 'CONFIG ACTIVE' : 'MISSING CONFIG'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                {language === 'id' 
                  ? 'Gunakan model Flash agar kuota gratis lebih awet. Key tersimpan di browser.' 
                  : 'Use Flash model to save free quota. Key stored in browser.'}
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col gap-3">
              <div className="flex gap-2">
                <input 
                  type="password" 
                  placeholder="Paste API Key (AIzaSy...)"
                  className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-mono text-xs bg-slate-50 min-w-[240px]"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
                <button 
                  onClick={handleSaveGemini} 
                  className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all uppercase text-[10px] shadow-lg"
                >
                  SAVE
                </button>
              </div>
              <select 
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-xs bg-white text-slate-700 appearance-none cursor-pointer"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value as GeminiModelId)}
              >
                <option value="gemini-1.5-flash">✨ Gemini 1.5 Flash (Recommended/Free)</option>
                <option value="gemini-1.5-pro">💎 Gemini 1.5 Pro (Smarter/Heavy)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groq Section */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-blue-200 transition-all">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
              <div>
                <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase">Groq Cloud</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${groqKey ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {groqKey ? 'KEY STORED' : 'MISSING KEY'}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
              {language === 'id' 
                ? 'Alternatif super cepat. Gunakan Llama-3 untuk hasil instan.' 
                : 'Super fast alternative. Use Llama-3 for instant results.'}
            </p>
          </div>
          <div className="w-full lg:w-96 flex gap-2">
            <input 
              type="password" 
              placeholder="Groq Key (gsk_...)"
              className="flex-1 px-5 py-5 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none transition-all font-mono text-xs bg-slate-50"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
            <button 
              onClick={handleSaveGroq} 
              className="px-8 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase text-[10px] shadow-lg"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t.data_title}</p>
          <p className="text-slate-500 text-sm mt-1">{t.data_reset_desc}</p>
        </div>
        <button 
          onClick={() => confirm(language === 'id' ? 'Hapus semua data?' : 'Wipe all data?') && onResetData()} 
          className="px-8 py-4 border-2 border-rose-100 text-rose-500 font-black rounded-2xl text-xs hover:bg-rose-50 transition-all uppercase tracking-widest"
        >
          {t.data_reset_btn}
        </button>
      </div>
    </div>
  );
};