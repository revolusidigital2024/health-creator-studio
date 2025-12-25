
import React, { useState, useEffect, useRef } from 'react';
import { GeminiModelId } from '../types';
import { storageService } from '../services/storageService';
import { 
  ShieldCheck, Info, Trash2, Save, Key, Cpu, Download, 
  Upload, CheckCircle2, AlertTriangle, ExternalLink, Globe, Zap, Sparkles 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsProps {
  onResetData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onResetData }) => {
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [groqKey, setGroqKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<GeminiModelId>('gemini-3-flash-preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGeminiKey(storageService.getGeminiKey() || '');
    setGroqKey(storageService.getGroqKey() || '');
    // Ensure we load the correct type
    const savedModel = storageService.getGeminiModel();
    if (savedModel === 'gemini-3-flash-preview' || savedModel === 'gemini-3-pro-preview') {
      setGeminiModel(savedModel);
    }
  }, []);

  const handleSaveGemini = () => {
    storageService.saveGeminiKey(geminiKey);
    storageService.saveGeminiModel(geminiModel);
    alert('✅ Konfigurasi Google Gemini berhasil disimpan!');
  };

  const handleSaveGroq = () => {
    storageService.saveGroqKey(groqKey);
    alert('✅ API Key Groq berhasil disimpan!');
  };

  const handleExport = () => {
    const data = storageService.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-creator-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonContent = event.target?.result as string;
      if (storageService.importData(jsonContent)) {
        alert('✅ Data berhasil dipulihkan! Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('❌ Gagal memulihkan data. Pastikan file JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 pb-32">
      
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Pengaturan Sistem</h2>
        <p className="text-slate-500 font-medium mt-2">Kelola konfigurasi AI dan pemeliharaan data studio Anda.</p>
      </div>

      {/* BACKUP & RESTORE SECTION */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-8">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
               <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/40">
                  <Download size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                   Backup & Restore Data
                 </h3>
                 <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                   Pindahkan Channel, Proyek, dan preferensi Anda ke perangkat lain. Gunakan file JSON untuk migrasi data yang aman.
                 </p>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
               <button 
                 onClick={handleExport}
                 className="flex-1 lg:flex-none px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
               >
                 <Download size={16} /> Download Backup
               </button>
               
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 style={{ display: 'none' }} 
                 accept=".json" 
                 onChange={handleFileChange}
               />
               <button 
                 onClick={handleImportClick}
                 className="flex-1 lg:flex-none px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
               >
                 <Upload size={16} /> Restore Data
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* GOOGLE GEMINI CARD */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:border-emerald-200 transition-all">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex items-start gap-6 w-full lg:w-1/2">
              <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-3xl border border-emerald-100 shrink-0 shadow-inner">✨</div>
              <div>
                <h4 className="font-black text-slate-800 text-2xl tracking-tight uppercase mb-1">Google Gemini</h4>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${geminiKey ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${geminiKey ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {geminiKey ? 'SISTEM AKTIF' : 'BELUM DIKONFIGURASI'}
                  </span>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <Info size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    Aplikasi menggunakan model <strong>Gemini 3</strong>. Pastikan Anda telah memiliki API Key yang valid dari Google AI Studio.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[450px] space-y-4">
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></div>
                  <input 
                    type="password" 
                    placeholder="Tempel API Key Gemini" 
                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all font-mono text-xs bg-slate-50 font-bold" 
                    value={geminiKey} 
                    onChange={(e) => setGeminiKey(e.target.value)} 
                  />
               </div>
               
               <div className="flex gap-3">
                 <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Cpu size={16} /></div>
                    <select 
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-emerald-500 outline-none transition-all text-xs bg-slate-50 font-bold appearance-none"
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value as GeminiModelId)}
                    >
                      <option value="gemini-3-flash">Gemini 3 Flash (Cepat & Stabil)</option>
                      <option value="gemini-3-pro">Gemini 3 Pro (Sangat Cerdas)</option>
                    </select>
                 </div>
                 <button 
                   onClick={handleSaveGemini} 
                   className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all uppercase text-[10px] flex items-center gap-2 shadow-xl active:scale-95"
                 >
                   <Save size={16} /> Simpan
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* GROQ CLOUD CARD */}
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:border-orange-200 transition-all flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-6 w-full lg:w-1/2">
            <div className="w-16 h-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center text-3xl border border-orange-100 shrink-0 shadow-inner">⚡</div>
            <div>
              <h4 className="font-black text-slate-800 text-2xl tracking-tight uppercase mb-1">Groq Cloud</h4>
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${groqKey ? 'bg-orange-500' : 'bg-slate-300'}`}></span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${groqKey ? 'text-orange-600' : 'text-slate-400'}`}>
                  {groqKey ? 'SISTEM AKTIF' : 'BELUM DIKONFIGURASI'}
                </span>
              </div>
              <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100 flex items-start gap-3">
                <Zap size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                  Alternatif Llama-3 super cepat. Masukkan API Key Groq Anda untuk mengaktifkan mesin cadangan.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px] flex gap-3">
             <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></div>
                <input 
                  type="password" 
                  placeholder="Tempel Groq API Key" 
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 outline-none transition-all font-mono text-xs bg-slate-50 font-bold" 
                  value={groqKey} 
                  onChange={(e) => setGroqKey(e.target.value)} 
                />
             </div>
             <button 
               onClick={handleSaveGroq} 
               className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all uppercase text-[10px] flex items-center gap-2 shadow-xl active:scale-95"
             >
               <Save size={16} /> Simpan
             </button>
          </div>
        </div>

      </div>

      {/* DANGER ZONE */}
      <div className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-50 p-8 rounded-[2.5rem]">
        <div className="text-center md:text-left">
          <p className="text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start mb-1">
            <Trash2 size={14} /> Zona Berbahaya
          </p>
          <p className="text-slate-500 text-sm font-medium">Reset pabrik akan menghapus seluruh channel dan proyek secara permanen.</p>
        </div>
        <button 
          onClick={() => confirm('Hapus SEMUA data secara permanen?') && onResetData()} 
          className="px-10 py-4 border-2 border-rose-100 text-rose-500 font-black rounded-2xl text-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg shadow-rose-100"
        >
          <Trash2 size={18} /> Reset Pabrik
        </button>
      </div>
    </div>
  );
};
