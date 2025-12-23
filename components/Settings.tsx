import React, { useState, useEffect } from 'react';
import { GeminiModelId } from '../types';
import { storageService } from '../services/storageService';
import { ShieldCheck, Info, Trash2, Save, Key, Cpu } from 'lucide-react';

interface SettingsProps {
  // Kita hapus prop 'language' karena sudah tidak dipakai
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onResetData }) => {
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [groqKey, setGroqKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<GeminiModelId>('gemini-2.5-flash');

  useEffect(() => {
    setGeminiKey(storageService.getGeminiKey() || '');
    setGroqKey(storageService.getGroqKey() || '');
    setGeminiModel((localStorage.getItem('health_creator_gemini_model') as GeminiModelId) || 'gemini-2.5-flash');
  }, []);

  const handleSaveGemini = () => {
    storageService.saveGeminiKey(geminiKey);
    localStorage.setItem('health_creator_gemini_model', geminiModel);
    alert('✅ Konfigurasi Gemini berhasil disimpan di browser!');
  };

  const handleSaveGroq = () => {
    storageService.saveGroqKey(groqKey);
    alert('✅ API Key Groq berhasil disimpan di browser!');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 pb-32">
      
      {/* HEADER */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Pengaturan Sistem</h2>
        <p className="text-slate-500 font-medium mt-2">Konfigurasi mesin AI (API Key) dan manajemen data.</p>
      </div>

      {/* PRIVACY NOTICE (PENTING) */}
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col md:flex-row items-start gap-4 mb-10 shadow-sm">
         <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shrink-0">
           <ShieldCheck size={28} />
         </div>
         <div>
           <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide mb-1">
             Keamanan Data Terjamin (BYOK)
           </h4>
           <p className="text-sm text-emerald-700/80 leading-relaxed">
             Aplikasi ini berjalan <strong>100% Client-Side</strong>. API Key yang Anda masukkan hanya disimpan di 
             <em> Local Storage</em> browser laptop Anda. Kami tidak memiliki server untuk menyimpan data Anda. 
             Privasi Anda sepenuhnya ada di tangan Anda.
           </p>
         </div>
      </div>

      <div className="space-y-8">
        
        {/* GEMINI SECTION */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-8 group hover:border-emerald-200 transition-all">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100">✨</div>
                <div>
                  <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase">Google Gemini</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${geminiKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${geminiKey ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {geminiKey ? 'Sistem Aktif' : 'Belum Dikonfigurasi'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md flex gap-2">
                <Info size={18} className="shrink-0 text-emerald-500" />
                Gunakan model <strong>2.5 Flash</strong> agar kuota gratisan awet & cepat. Gunakan <strong>Pro</strong> jika butuh analisis mendalam.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col gap-4">
              <div className="flex gap-2 w-full lg:w-[400px]">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Tempel API Key Gemini (AIzaSy...)"
                    className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-xs bg-slate-50 font-bold text-slate-700"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleSaveGemini} 
                  className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all uppercase text-[10px] flex items-center gap-2 shadow-lg"
                >
                  <Save size={16} /> Simpan
                </button>
              </div>
              
              <div className="relative w-full lg:w-[400px]">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Cpu size={16} />
                  </div>
                <select 
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-xs bg-white text-slate-700 appearance-none cursor-pointer"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value as GeminiModelId)}
                >
                  <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (Cepat & Hemat - Direkomendasikan)</option>
                  <option value="gemini-2.5-pro">💎 Gemini 2.5 Pro (Pintar - Kuota Berat)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▼</div>
              </div>
            </div>
          </div>
        </div>

        {/* GROQ SECTION */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-8 group hover:border-orange-200 transition-all">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl border border-orange-100">⚡</div>
                <div>
                  <h4 className="font-black text-slate-800 text-xl tracking-tight uppercase">Groq Cloud (Llama 3)</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${groqKey ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${groqKey ? 'text-orange-600' : 'text-slate-400'}`}>
                      {groqKey ? 'Sistem Aktif' : 'Belum Dikonfigurasi'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md flex gap-2">
                <Info size={18} className="shrink-0 text-orange-500" />
                Alternatif mesin super cepat menggunakan Llama-3. Cocok untuk brainstorming ide kilat jika Gemini sedang lambat.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex gap-2 w-full lg:w-[400px]">
              <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Key size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Tempel API Key Groq (gsk_...)"
                    className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-mono text-xs bg-slate-50 font-bold text-slate-700"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                  />
              </div>
              <button 
                onClick={handleSaveGroq} 
                className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all uppercase text-[10px] flex items-center gap-2 shadow-lg"
              >
                <Save size={16} /> Simpan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 opacity-80 hover:opacity-100 transition-opacity">
        <div className="text-center md:text-left">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
            <Trash2 size={12} /> Zona Bahaya
          </p>
          <p className="text-slate-500 text-sm mt-1 font-medium">Hapus semua data channel dan proyek dari browser ini.</p>
        </div>
        <button 
          onClick={() => confirm('Yakin ingin menghapus SEMUA data? Channel dan Proyek akan hilang permanen.') && onResetData()} 
          className="px-8 py-4 border-2 border-rose-100 text-rose-500 font-black rounded-2xl text-xs hover:bg-rose-50 hover:border-rose-200 transition-all uppercase tracking-widest flex items-center gap-2"
        >
          <Trash2 size={16} /> Reset Pabrik
        </button>
      </div>
    </div>
  );
};